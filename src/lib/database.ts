import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { 
  signInAnonymously, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { db, auth } from './firebase';
import type { ContentItem, CheatSheetCategory } from '@/integrations/firebase/types';

export interface CheatSheetData {
  id?: string;
  userId?: string;
  title: string;
  description?: string;
  category: CheatSheetCategory;
  content: {
    items: ContentItem[];
  };
  isPublic?: boolean;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

// Get current user session
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Create anonymous session if no user is logged in
export const ensureAnonymousSession = async (): Promise<User> => {
  const user = await getCurrentUser();
  
  if (!user) {
    // Sign in anonymously
    const { user: anonymousUser } = await signInAnonymously(auth);
    if (!anonymousUser) {
      throw new Error('Failed to create anonymous session');
    }
    return anonymousUser;
  }
  
  return user;
};

// Convert Firestore document to CheatSheetData
const convertFirestoreDoc = (doc: any): CheatSheetData => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    title: data.title,
    description: data.description,
    category: data.category,
    content: data.content,
    isPublic: data.isPublic || false,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Fetch all cheat sheets for current user
export const fetchCheatSheets = async (): Promise<CheatSheetData[]> => {
  const user = await ensureAnonymousSession();
  try {
    // Primary query: filter by userId and order by updatedAt desc
    const q = query(
      collection(db, 'cheatSheets'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertFirestoreDoc);
  } catch (err: any) {
    // If composite index is missing, Firestore can throw FAILED_PRECONDITION
    const code = err?.code || err?.name || '';
    if (typeof code === 'string' && code.toLowerCase().includes('failed-precondition')) {
      console.warn('[fetchCheatSheets] Missing composite index for (userId, updatedAt). Falling back to client-side sort. Consider creating a Firestore composite index: cheatSheets: where userId ==, orderBy updatedAt desc');
      const fallbackQ = query(
        collection(db, 'cheatSheets'),
        where('userId', '==', user.uid)
      );
      const fallbackSnap = await getDocs(fallbackQ);
      const items = fallbackSnap.docs.map(convertFirestoreDoc);
      // Client-side sort by updatedAt (handles Date or Timestamp converted to Date)
      return items.sort((a, b) => {
        const ta = a.updatedAt instanceof Date ? a.updatedAt.getTime() : (a.updatedAt as any)?.toMillis?.() ?? 0;
        const tb = b.updatedAt instanceof Date ? b.updatedAt.getTime() : (b.updatedAt as any)?.toMillis?.() ?? 0;
        return tb - ta;
      });
    }
    console.error('[fetchCheatSheets] Unexpected error:', err);
    throw err;
  }
};

// Create a new cheat sheet
export const createCheatSheet = async (cheatSheetData: Omit<CheatSheetData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<CheatSheetData> => {
  try {
    console.log('Starting createCheatSheet with data:', cheatSheetData);
    const user = await ensureAnonymousSession();
    console.log('User session ensured:', user.uid);

    const docData = {
      userId: user.uid,
      title: cheatSheetData.title,
      description: cheatSheetData.description,
      category: cheatSheetData.category,
      content: cheatSheetData.content,
      isPublic: cheatSheetData.isPublic || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log('Attempting to add document to Firestore with data:', docData);
    const docRef = await addDoc(collection(db, 'cheatSheets'), docData);
    console.log('Document added with ID:', docRef.id);
    
    // Get the created document to return with proper timestamps
    const createdDoc = await getDoc(docRef);
    if (!createdDoc.exists()) {
      throw new Error('Failed to retrieve created document');
    }
    
    const result = convertFirestoreDoc(createdDoc);
    console.log('Successfully created cheat sheet:', result);
    return result;
  } catch (error) {
    console.error('Error in createCheatSheet:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorName: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      cheatSheetData
    });
    throw error; // Re-throw to be handled by the caller
  }
};

// Update an existing cheat sheet
export const updateCheatSheet = async (id: string, updates: Partial<Omit<CheatSheetData, 'id' | 'userId' | 'createdAt'>>): Promise<CheatSheetData> => {
  const user = await ensureAnonymousSession();
  
  const docRef = doc(db, 'cheatSheets', id);
  
  // Verify ownership
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error('Cheat sheet not found');
  }
  
  const data = docSnap.data();
  if (data.userId !== user.uid) {
    throw new Error('Unauthorized: You can only update your own cheat sheets');
  }

  const updateData = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(docRef, updateData);
  
  // Get the updated document
  const updatedDoc = await getDoc(docRef);
  return convertFirestoreDoc(updatedDoc);
};

// Delete a cheat sheet
export const deleteCheatSheet = async (id: string): Promise<boolean> => {
  const user = await ensureAnonymousSession();
  
  const docRef = doc(db, 'cheatSheets', id);
  
  // Verify ownership
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error('Cheat sheet not found');
  }
  
  const data = docSnap.data();
  if (data.userId !== user.uid) {
    throw new Error('Unauthorized: You can only delete your own cheat sheets');
  }

  await deleteDoc(docRef);
  return true;
};

// Get a single cheat sheet by ID
export const getCheatSheetById = async (id: string): Promise<CheatSheetData | null> => {
  const user = await ensureAnonymousSession();
  
  const docRef = doc(db, 'cheatSheets', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  const data = docSnap.data();
  if (data.userId !== user.uid) {
    throw new Error('Unauthorized: You can only access your own cheat sheets');
  }
  
  return convertFirestoreDoc(docSnap);
};