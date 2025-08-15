// Local storage utilities for cheat sheets
export interface StoredCheatSheet {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: 'mathematics' | 'software' | 'coding' | 'study' | 'other';
  content: {
    items: Array<{
      id: string;
      type: 'text' | 'math' | 'code';
      content: string;
      title?: string;
      color?: string;
    }>;
  };
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'cheatsheets';

export const getStoredCheatSheets = (): StoredCheatSheet[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((sheet: any) => ({
      ...sheet,
      createdAt: new Date(sheet.createdAt),
      updatedAt: new Date(sheet.updatedAt),
    }));
  } catch (error) {
    console.error('Error loading cheat sheets from storage:', error);
    return [];
  }
};

export const saveCheatSheet = (cheatSheet: Omit<StoredCheatSheet, 'id' | 'createdAt' | 'updatedAt'>): StoredCheatSheet => {
  const sheets = getStoredCheatSheets();
  const now = new Date();
  
  const newSheet: StoredCheatSheet = {
    ...cheatSheet,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  
  sheets.push(newSheet);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
  
  return newSheet;
};

export const updateCheatSheet = (id: string, updates: Partial<Omit<StoredCheatSheet, 'id' | 'createdAt'>>): StoredCheatSheet | null => {
  const sheets = getStoredCheatSheets();
  const index = sheets.findIndex(sheet => sheet.id === id);
  
  if (index === -1) return null;
  
  const updatedSheet = {
    ...sheets[index],
    ...updates,
    updatedAt: new Date(),
  };
  
  sheets[index] = updatedSheet;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
  
  return updatedSheet;
};

export const deleteCheatSheet = (id: string): boolean => {
  const sheets = getStoredCheatSheets();
  const filteredSheets = sheets.filter(sheet => sheet.id !== id);
  
  if (filteredSheets.length === sheets.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSheets));
  return true;
};

export const getCheatSheetById = (id: string): StoredCheatSheet | null => {
  const sheets = getStoredCheatSheets();
  return sheets.find(sheet => sheet.id === id) || null;
};