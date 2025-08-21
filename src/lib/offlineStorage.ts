// Offline storage utilities with sync capabilities
import { CheatSheetData } from './database';

const OFFLINE_STORAGE_KEY = 'offline_cheatsheets';
const SYNC_QUEUE_KEY = 'sync_queue';

export interface OfflineCheatSheet extends CheatSheetData {
  isOffline?: boolean;
  needsSync?: boolean;
}

export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  data?: Partial<CheatSheetData>;
  timestamp: number;
}

// Get offline stored cheat sheets
export const getOfflineCheatSheets = (): OfflineCheatSheet[] => {
  try {
    const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading offline cheat sheets:', error);
    return [];
  }
};

// Save cheat sheet offline
export const saveOfflineCheatSheet = (cheatSheet: OfflineCheatSheet): void => {
  try {
    const sheets = getOfflineCheatSheets();
    const existingIndex = sheets.findIndex(s => s.id === cheatSheet.id);
    
    if (existingIndex >= 0) {
      sheets[existingIndex] = { ...cheatSheet, needsSync: true };
    } else {
      sheets.push({ ...cheatSheet, isOffline: true, needsSync: true });
    }
    
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(sheets));
  } catch (error) {
    console.error('Error saving offline cheat sheet:', error);
  }
};

// Delete offline cheat sheet
export const deleteOfflineCheatSheet = (id: string): void => {
  try {
    const sheets = getOfflineCheatSheets();
    const filteredSheets = sheets.filter(sheet => sheet.id !== id);
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(filteredSheets));
  } catch (error) {
    console.error('Error deleting offline cheat sheet:', error);
  }
};

// Add item to sync queue
export const addToSyncQueue = (item: SyncQueueItem): void => {
  try {
    const queue = getSyncQueue();
    queue.push(item);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error adding to sync queue:', error);
  }
};

// Get sync queue
export const getSyncQueue = (): SyncQueueItem[] => {
  try {
    const stored = localStorage.getItem(SYNC_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading sync queue:', error);
    return [];
  }
};

// Clear sync queue
export const clearSyncQueue = (): void => {
  try {
    localStorage.removeItem(SYNC_QUEUE_KEY);
  } catch (error) {
    console.error('Error clearing sync queue:', error);
  }
};

// Merge online and offline data
export const mergeCheatSheets = (onlineSheets: CheatSheetData[], offlineSheets: OfflineCheatSheet[]): CheatSheetData[] => {
  const merged = [...onlineSheets];
  
  // Add offline-only sheets
  offlineSheets.forEach(offlineSheet => {
    if (!merged.find(sheet => sheet.id === offlineSheet.id)) {
      merged.push(offlineSheet);
    }
  });
  
  // Sort by updated_at
  return merged.sort((a, b) => {
    const dateA = a.updatedAt ? (a.updatedAt instanceof Date ? a.updatedAt : a.updatedAt.toDate()).getTime() : 0;
    const dateB = b.updatedAt ? (b.updatedAt instanceof Date ? b.updatedAt : b.updatedAt.toDate()).getTime() : 0;
    return dateB - dateA;
  });
};