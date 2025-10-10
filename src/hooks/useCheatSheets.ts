import { useState, useEffect } from 'react';
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
  incrementCheatSheetView,
  toggleFavoriteStatus,
  CustomCategoryData,
} from '@/lib/database';
import type { CheatSheetData } from '@/lib/database';

export const useCheatSheets = () => {
  const [cheatSheets, setCheatSheets] = useState<CheatSheetData[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    initializeData();
    
    // Listen for online/offline events
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
      // Fetch latest data
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
    if (!navigator.onLine) {
      toast({
        title: "No Internet Connection",
        description: "Please connect to the internet to load your cheat sheets",
        variant: "destructive",
      });
      return;
    }

    try {
      const onlineSheets = await fetchCheatSheets();
      setCheatSheets(onlineSheets);
    } catch (error) {
      console.error('Error loading cheat sheets:', error);
      toast({
        title: "Error",
        description: "Failed to load cheat sheets. Please check your internet connection.",
        variant: "destructive",
      });
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
    if (!navigator.onLine) {
      toast({
        title: "No Internet Connection",
        description: "Please connect to the internet to save your cheat sheet",
        variant: "destructive",
      });
      throw new Error('No internet connection');
    }

    try {
      const newSheet = await createCheatSheet(data);
      setCheatSheets(prev => [newSheet, ...prev]);
      return newSheet;
    } catch (error) {
      console.error('Error saving cheat sheet:', error);
      throw error;
    }
  };

  const updateCheatSheetData = async (id: string, updates: Partial<CheatSheetData>) => {
    if (!navigator.onLine) {
      toast({
        title: "No Internet Connection",
        description: "Please connect to the internet to update your cheat sheet",
        variant: "destructive",
      });
      throw new Error('No internet connection');
    }

    try {
      const updatedSheet = await updateCheatSheet(id, updates);
      setCheatSheets(prev => 
        prev.map(sheet => sheet.id === id ? updatedSheet : sheet)
      );
      return updatedSheet;
    } catch (error) {
      console.error('Error updating cheat sheet:', error);
      throw error;
    }
  };

  const deleteCheatSheetData = async (id: string) => {
    if (!navigator.onLine) {
      toast({
        title: "No Internet Connection",
        description: "Please connect to the internet to delete your cheat sheet",
        variant: "destructive",
      });
      throw new Error('No internet connection');
    }

    try {
      await deleteCheatSheet(id);
      setCheatSheets(prev => prev.filter(sheet => sheet.id !== id));
    } catch (error) {
      console.error('Error deleting cheat sheet:', error);
      throw error;
    }
  };

  const getCheatSheetByIdData = async (id: string): Promise<CheatSheetData | null> => {
    if (!navigator.onLine) {
      toast({
        title: "No Internet Connection",
        description: "Please connect to the internet to access your cheat sheet",
        variant: "destructive",
      });
      return null;
    }

    try {
      return await getCheatSheetById(id);
    } catch (error) {
      console.error('Error getting cheat sheet:', error);
      return null;
    }
  };

  const saveCustomCategory = async (data: Omit<CustomCategoryData, 'id' | 'userId' | 'createdAt'>) => {
    if (!navigator.onLine) {
      toast({
        title: "No Internet Connection",
        description: "Please connect to the internet to save your custom category",
        variant: "destructive",
      });
      throw new Error('No internet connection');
    }

    try {
      const newCategory = await createCustomCategory(data);
      setCustomCategories(prev => [newCategory, ...prev]);
      return newCategory;
    } catch (error) {
      console.error('Error saving custom category:', error);
      throw error;
    }
  };

  const deleteCustomCategoryData = async (id: string) => {
    if (!navigator.onLine) {
      toast({
        title: "No Internet Connection",
        description: "Please connect to the internet to delete your custom category",
        variant: "destructive",
      });
      throw new Error('No internet connection');
    }

    try {
      await deleteCustomCategory(id);
      setCustomCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (error) {
      console.error('Error deleting custom category:', error);
      throw error;
    }
  };

  const incrementView = async (id: string) => {
    if (!navigator.onLine) {
      return;
    }
    // Optimistic update
    setCheatSheets(prev =>
      prev.map(sheet =>
        sheet.id === id ? { ...sheet, views: (sheet.views || 0) + 1 } : sheet
      )
    );
    try {
      await incrementCheatSheetView(id);
    } catch (error) {
      console.error('Error incrementing view count:', error);
      // Revert on error
      setCheatSheets(prev =>
        prev.map(sheet =>
          sheet.id === id ? { ...sheet, views: (sheet.views || 0) - 1 } : sheet
        )
      );
      toast({
        title: "Error",
        description: "Failed to update view count on the server.",
        variant: "destructive",
      });
    }
  };

  const toggleFavorite = async (id: string, currentStatus: boolean) => {
    if (!navigator.onLine) {
      toast({
        title: "No Internet Connection",
        description: "Please connect to the internet to update favorites.",
        variant: "destructive",
      });
      return;
    }
    // Optimistic update
    setCheatSheets(prev =>
      prev.map(sheet =>
        sheet.id === id ? { ...sheet, isFavorite: !currentStatus } : sheet
      )
    );
    try {
      await toggleFavoriteStatus(id, currentStatus);
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      // Revert on error
      setCheatSheets(prev =>
        prev.map(sheet =>
          sheet.id === id ? { ...sheet, isFavorite: currentStatus } : sheet
        )
      );
      toast({
        title: "Error",
        description: "Failed to update favorite status on the server.",
        variant: "destructive",
      });
    }
  };

  return {
    cheatSheets,
    customCategories,
    isLoading,
    isOnline,
    saveCheatSheet,
    updateCheatSheet: updateCheatSheetData,
    deleteCheatSheet: deleteCheatSheetData,
    getCheatSheetById: getCheatSheetByIdData,
    refreshCheatSheets: loadCheatSheets,
    saveCustomCategory,
    deleteCustomCategory: deleteCustomCategoryData,
    refreshCustomCategories: loadCustomCategories,
    incrementView,
    toggleFavorite,
  };
};