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
  
  const q = query(
    collection(db, 'cheatSheets'),
    where('userId', '==', user.uid),
    orderBy('updatedAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(convertFirestoreDoc);
};

// Create a new cheat sheet
export const createCheatSheet = async (cheatSheetData: Omit<CheatSheetData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<CheatSheetData> => {
  const user = await ensureAnonymousSession();

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

  const docRef = await addDoc(collection(db, 'cheatSheets'), docData);
  
  // Get the created document to return with proper timestamps
  const createdDoc = await getDoc(docRef);
  return convertFirestoreDoc(createdDoc);
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

// Migrate existing localStorage data to Firestore
export const migrateLocalStorageToFirestore = async () => {
  try {
    const localData = localStorage.getItem('cheatsheets');
    if (!localData) return;

    const sheets = JSON.parse(localData);
    const user = await ensureAnonymousSession();

    for (const sheet of sheets) {
      try {
        await addDoc(collection(db, 'cheatSheets'), {
          userId: user.uid,
          title: sheet.title,
          description: sheet.description,
          category: sheet.category,
          content: sheet.content,
          isPublic: sheet.isPublic || false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error migrating sheet:', sheet.title, error);
      }
    }

    // Clear localStorage after successful migration
    localStorage.removeItem('cheatsheets');
    console.log('Successfully migrated localStorage data to Firestore');
  } catch (error) {
    console.error('Error during migration:', error);
  }
};