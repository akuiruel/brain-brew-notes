import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchCheatSheets, 
  createCheatSheet, 
  updateCheatSheet, 
  deleteCheatSheet,
  migrateLocalStorageToSupabase 
} from '@/lib/database';
import { 
  getOfflineCheatSheets, 
  saveOfflineCheatSheet, 
  deleteOfflineCheatSheet,
  mergeCheatSheets,
  addToSyncQueue,
  getSyncQueue,
  clearSyncQueue
} from '@/lib/offlineStorage';
import type { CheatSheetData } from '@/lib/database';
import type { ContentItem, CheatSheetCategory } from '@/integrations/firebase/types';

export const useCheatSheets = () => {
  const [cheatSheets, setCheatSheets] = useState<CheatSheetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    initializeData();
    
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      syncData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initializeData = async () => {
    try {
      if (isOnline) {
        // Migrate localStorage data if exists
        await migrateLocalStorageToSupabase();
        // Sync any pending changes
        await syncData();
        // Fetch latest data
        await loadCheatSheets();
      } else {
        // Load offline data
        const offlineSheets = getOfflineCheatSheets();
        setCheatSheets(offlineSheets);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      // Fallback to offline data
      const offlineSheets = getOfflineCheatSheets();
      setCheatSheets(offlineSheets);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCheatSheets = async () => {
    try {
      if (isOnline) {
        const onlineSheets = await fetchCheatSheets();
        const offlineSheets = getOfflineCheatSheets();
        const merged = mergeCheatSheets(onlineSheets, offlineSheets);
        setCheatSheets(merged);
      } else {
        const offlineSheets = getOfflineCheatSheets();
        setCheatSheets(offlineSheets);
      }
    } catch (error) {
      console.error('Error loading cheat sheets:', error);
      toast({
        title: "Error",
        description: "Failed to load cheat sheets",
        variant: "destructive",
      });
    }
  };

  const syncData = async () => {
    if (!isOnline) return;

    try {
      const syncQueue = getSyncQueue();
      
      for (const item of syncQueue) {
        try {
          switch (item.action) {
            case 'create':
              if (item.data) {
                await createCheatSheet(item.data as any);
              }
              break;
            case 'update':
              if (item.data) {
                await updateCheatSheet(item.id, item.data);
              }
              break;
            case 'delete':
              await deleteCheatSheet(item.id);
              break;
          }
        } catch (error) {
          console.error('Error syncing item:', item, error);
        }
      }
      
      clearSyncQueue();
      await loadCheatSheets();
    } catch (error) {
      console.error('Error during sync:', error);
    }
  };

  const saveCheatSheet = async (data: Omit<CheatSheetData, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (isOnline) {
        const newSheet = await createCheatSheet(data);
        setCheatSheets(prev => [newSheet, ...prev]);
        return newSheet;
      } else {
        // Save offline
        const offlineSheet: CheatSheetData = {
          ...data,
          id: crypto.randomUUID(),
          user_id: 'offline',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        saveOfflineCheatSheet(offlineSheet);
        addToSyncQueue({
          id: offlineSheet.id!,
          action: 'create',
          data: offlineSheet,
          timestamp: Date.now(),
        });
        
        setCheatSheets(prev => [offlineSheet, ...prev]);
        
        toast({
          title: "Saved Offline",
          description: "Your cheat sheet will sync when you're back online",
        });
        
        return offlineSheet;
      }
    } catch (error) {
      console.error('Error saving cheat sheet:', error);
      throw error;
    }
  };

  const updateCheatSheetData = async (id: string, updates: Partial<CheatSheetData>) => {
    try {
      if (isOnline) {
        const updatedSheet = await updateCheatSheet(id, updates);
        setCheatSheets(prev => 
          prev.map(sheet => sheet.id === id ? updatedSheet : sheet)
        );
        return updatedSheet;
      } else {
        // Update offline
        const offlineSheets = getOfflineCheatSheets();
        const updatedSheets = offlineSheets.map(sheet => 
          sheet.id === id 
            ? { ...sheet, ...updates, updated_at: new Date().toISOString(), needsSync: true }
            : sheet
        );
        
        localStorage.setItem('offline_cheatsheets', JSON.stringify(updatedSheets));
        addToSyncQueue({
          id,
          action: 'update',
          data: updates,
          timestamp: Date.now(),
        });
        
        setCheatSheets(prev => 
          prev.map(sheet => 
            sheet.id === id 
              ? { ...sheet, ...updates, updated_at: new Date().toISOString() }
              : sheet
          )
        );
        
        toast({
          title: "Updated Offline",
          description: "Changes will sync when you're back online",
        });
      }
    } catch (error) {
      console.error('Error updating cheat sheet:', error);
      throw error;
    }
  };

  const deleteCheatSheetData = async (id: string) => {
    try {
      if (isOnline) {
        await deleteCheatSheet(id);
        setCheatSheets(prev => prev.filter(sheet => sheet.id !== id));
      } else {
        // Delete offline
        deleteOfflineCheatSheet(id);
        addToSyncQueue({
          id,
          action: 'delete',
          timestamp: Date.now(),
        });
        
        setCheatSheets(prev => prev.filter(sheet => sheet.id !== id));
        
        toast({
          title: "Deleted Offline",
          description: "Deletion will sync when you're back online",
        });
      }
    } catch (error) {
      console.error('Error deleting cheat sheet:', error);
      throw error;
    }
  };

  const getCheatSheetByIdData = async (id: string): Promise<CheatSheetData | null> => {
    try {
      if (isOnline) {
        return await getCheatSheetById(id);
      } else {
        const offlineSheets = getOfflineCheatSheets();
        return offlineSheets.find(sheet => sheet.id === id) || null;
      }
    } catch (error) {
      console.error('Error getting cheat sheet:', error);
      return null;
    }
  };

  return {
    cheatSheets,
    isLoading,
    isOnline,
    saveCheatSheet,
    updateCheatSheet: updateCheatSheetData,
    deleteCheatSheet: deleteCheatSheetData,
    getCheatSheetById: getCheatSheetByIdData,
    refreshCheatSheets: loadCheatSheets,
    syncData,
  };
};