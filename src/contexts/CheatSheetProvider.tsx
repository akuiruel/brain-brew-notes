import React, { createContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  fetchCheatSheets,
  createCheatSheet,
  updateCheatSheet,
  deleteCheatSheet,
  getCheatSheetById,
  fetchCustomCategories,
  createCustomCategory,
  deleteCustomCategory,
  CustomCategoryData,
  CheatSheetData,
} from '@/lib/database';

interface CheatSheetContextType {
  cheatSheets: CheatSheetData[];
  customCategories: CustomCategoryData[];
  isLoading: boolean;
  isOnline: boolean;
  saveCheatSheet: (data: Omit<CheatSheetData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<CheatSheetData>;
  updateCheatSheet: (id: string, updates: Partial<CheatSheetData>) => Promise<CheatSheetData>;
  deleteCheatSheet: (id: string) => Promise<void>;
  getCheatSheetById: (id: string) => Promise<CheatSheetData | null>;
  toggleContentItemReadStatus: (sheetId: string, itemId: string) => Promise<void>;
  refreshCheatSheets: () => Promise<void>;
  saveCustomCategory: (data: Omit<CustomCategoryData, 'id' | 'userId' | 'createdAt'>) => Promise<CustomCategoryData>;
  deleteCustomCategory: (id: string) => Promise<void>;
  refreshCustomCategories: () => Promise<void>;
}

export const CheatSheetContext = createContext<CheatSheetContextType | undefined>(undefined);

export const CheatSheetProvider = ({ children }: { children: React.ReactNode }) => {
  const [cheatSheets, setCheatSheets] = useState<CheatSheetData[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    initializeData();

    const handleOnline = () => {
      setIsOnline(true);
      loadCheatSheets();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Connection Lost",
        description: "You need an internet connection to use this app",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initializeData = async () => {
    if (!navigator.onLine) {
      setIsLoading(false);
      toast({
        title: "No Internet Connection",
        description: "Please connect to the internet to use this app",
        variant: "destructive",
      });
      return;
    }

    try {
      await loadCheatSheets();
      await loadCustomCategories();
    } catch (error) {
      console.error('Error initializing data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please check your internet connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCheatSheets = async () => {
    if (!navigator.onLine) return;
    try {
      const onlineSheets = await fetchCheatSheets();
      setCheatSheets(onlineSheets);
    } catch (error) {
      console.error('Error loading cheat sheets:', error);
    }
  };

  const loadCustomCategories = async () => {
    if (!navigator.onLine) return;
    try {
      const categories = await fetchCustomCategories();
      setCustomCategories(categories);
    } catch (error) {
      console.error('Error loading custom categories:', error);
    }
  };

  const saveCheatSheet = async (data: Omit<CheatSheetData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!navigator.onLine) throw new Error('No internet connection');
    const newSheet = await createCheatSheet(data);
    setCheatSheets(prev => [newSheet, ...prev]);
    return newSheet;
  };

  const updateCheatSheetData = async (id: string, updates: Partial<CheatSheetData>) => {
    if (!navigator.onLine) throw new Error('No internet connection');
    const updatedSheet = await updateCheatSheet(id, updates);
    setCheatSheets(prev => prev.map(sheet => (sheet.id === id ? updatedSheet : sheet)));
    return updatedSheet;
  };

  const deleteCheatSheetData = async (id: string) => {
    if (!navigator.onLine) throw new Error('No internet connection');
    await deleteCheatSheet(id);
    setCheatSheets(prev => prev.filter(sheet => sheet.id !== id));
  };

  const getCheatSheetByIdData = async (id: string) => getCheatSheetById(id);

  const saveCustomCategory = async (data: Omit<CustomCategoryData, 'id' | 'userId' | 'createdAt'>) => {
    if (!navigator.onLine) throw new Error('No internet connection');
    const newCategory = await createCustomCategory(data);
    setCustomCategories(prev => [newCategory, ...prev]);
    return newCategory;
  };

  const deleteCustomCategoryData = async (id: string) => {
    if (!navigator.onLine) throw new Error('No internet connection');
    await deleteCustomCategory(id);
    setCustomCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const toggleContentItemReadStatus = async (sheetId: string, itemId: string) => {
    setCheatSheets(prevSheets => {
      const newSheets = prevSheets.map(sheet => {
        if (sheet.id === sheetId) {
          const updatedItems = sheet.content.items.map(item => {
            if (item.id === itemId) {
              return { ...item, isRead: !item.isRead };
            }
            return item;
          });
          return { ...sheet, content: { items: updatedItems } };
        }
        return sheet;
      });

      const updatedSheet = newSheets.find(s => s.id === sheetId);
      if (updatedSheet) {
        updateCheatSheet(sheetId, { content: updatedSheet.content }).catch(error => {
          console.error('Failed to persist read status:', error);
          setCheatSheets(prevSheets); // Revert on failure
          toast({ title: "Error", description: "Failed to sync read status.", variant: "destructive" });
        });
      }
      return newSheets;
    });
  };

  const value = {
    cheatSheets,
    customCategories,
    isLoading,
    isOnline,
    saveCheatSheet,
    updateCheatSheet: updateCheatSheetData,
    deleteCheatSheet: deleteCheatSheetData,
    getCheatSheetById: getCheatSheetByIdData,
    toggleContentItemReadStatus,
    refreshCheatSheets: loadCheatSheets,
    saveCustomCategory,
    deleteCustomCategory: deleteCustomCategoryData,
    refreshCustomCategories: loadCustomCategories,
  };

  return <CheatSheetContext.Provider value={value}>{children}</CheatSheetContext.Provider>;
};