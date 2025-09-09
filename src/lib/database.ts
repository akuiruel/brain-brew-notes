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
  Timestamp,
  deleteField
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
  customCategory?: string; // For custom category name
  content: {
    items: ContentItem[];
  };
  isPublic?: boolean;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface CustomCategoryData {
  id?: string;
  userId?: string;
  name: string;
  color: string;
  icon: string;
  createdAt?: Date | Timestamp;
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
    customCategory: data.customCategory,
    content: data.content,
    isPublic: data.isPublic || false,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Convert Firestore document to CustomCategoryData
const convertCustomCategoryDoc = (doc: any): CustomCategoryData => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    name: data.name,
    color: data.color,
    icon: data.icon,
    createdAt: data.createdAt?.toDate() || new Date(),
  };
};

// Fetch all cheat sheets for current user
export const fetchCheatSheets = async (): Promise<CheatSheetData[]> => {
  const user = await ensureAnonymousSession();
  try {
    // Primary query: get all cheatSheets ordered by updatedAt desc
    const q = query(
      collection(db, 'cheatSheets'),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertFirestoreDoc);
  } catch (err: any) {
    // If index is missing, fall back to client-side sort
    console.warn('[fetchCheatSheets] Falling back to client-side sort for updatedAt desc', err);
    const fallbackQ = query(
      collection(db, 'cheatSheets')
    );
    const fallbackSnap = await getDocs(fallbackQ);
    const items = fallbackSnap.docs.map(convertFirestoreDoc);
    return items.sort((a, b) => {
      const ta = a.updatedAt instanceof Date ? a.updatedAt.getTime() : (a.updatedAt as any)?.toMillis?.() ?? 0;
      const tb = b.updatedAt instanceof Date ? b.updatedAt.getTime() : (b.updatedAt as any)?.toMillis?.() ?? 0;
      return tb - ta;
    });
  }
};

// Create a new cheat sheet
export const createCheatSheet = async (cheatSheetData: Omit<CheatSheetData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<CheatSheetData> => {
  try {
    console.log('Starting createCheatSheet with data:', cheatSheetData);
    const user = await ensureAnonymousSession();
    console.log('User session ensured:', user.uid);

    const docData: any = {
  userId: user.uid,
  title: cheatSheetData.title,
  description: cheatSheetData.description,
  category: cheatSheetData.category,
  content: cheatSheetData.content,
  isPublic: cheatSheetData.isPublic || false,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
};

// Only include customCategory if it has a value
if (cheatSheetData.customCategory) {
  docData.customCategory = cheatSheetData.customCategory;
}

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
  
  // Remove strict ownership verification to allow cross-browser edits on same collection
  const updateData: any = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  // If customCategory was explicitly passed in updates and is undefined,
  // this means we want to remove this field.
  if (updates.hasOwnProperty('customCategory') && updates.customCategory === undefined) {
    updateData.customCategory = deleteField();
  }

  await updateDoc(docRef, updateData);
  
  // Get the updated document
  const updatedDoc = await getDoc(docRef);
  return convertFirestoreDoc(updatedDoc);
};

// Delete a cheat sheet
export const deleteCheatSheet = async (id: string): Promise<boolean> => {
  const user = await ensureAnonymousSession();
  
  const docRef = doc(db, 'cheatSheets', id);
  
  // Remove strict ownership verification to allow cross-browser deletes
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
  
  return convertFirestoreDoc(docSnap);
};

// Custom Categories functions
export const fetchCustomCategories = async (): Promise<CustomCategoryData[]> => {
  const user = await ensureAnonymousSession();
  try {
    const q = query(
      collection(db, 'customCategories'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertCustomCategoryDoc);
  } catch (err: any) {
    console.warn('[fetchCustomCategories] Falling back to client-side sort', err);
    const fallbackQ = query(
      collection(db, 'customCategories'),
      where('userId', '==', user.uid)
    );
    const fallbackSnap = await getDocs(fallbackQ);
    const items = fallbackSnap.docs.map(convertCustomCategoryDoc);
    return items.sort((a, b) => {
      const ta = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any)?.toMillis?.() ?? 0;
      const tb = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any)?.toMillis?.() ?? 0;
      return tb - ta;
    });
  }
};

export const createCustomCategory = async (categoryData: Omit<CustomCategoryData, 'id' | 'userId' | 'createdAt'>): Promise<CustomCategoryData> => {
  const user = await ensureAnonymousSession();
  
  const docData = {
    userId: user.uid,
    name: categoryData.name,
    color: categoryData.color,
    icon: categoryData.icon,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'customCategories'), docData);
  
  const createdDoc = await getDoc(docRef);
  if (!createdDoc.exists()) {
    throw new Error('Failed to retrieve created custom category');
  }
  
  return convertCustomCategoryDoc(createdDoc);
};

export const deleteCustomCategory = async (id: string): Promise<boolean> => {
  const user = await ensureAnonymousSession();
  
  const docRef = doc(db, 'customCategories', id);
  await deleteDoc(docRef);
  return true;
};