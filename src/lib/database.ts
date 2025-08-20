import { supabase } from './supabase';
import type { ContentItem, CheatSheetCategory } from '@/integrations/firebase/types';

export interface CheatSheetData {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  category: CheatSheetCategory;
  content: {
    items: ContentItem[];
  };
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Get current user session
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Create anonymous session if no user is logged in
export const ensureAnonymousSession = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Sign in anonymously
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error('Error creating anonymous session:', error);
      throw error;
    }
    return data.user;
  }
  
  return user;
};

// Fetch all cheat sheets for current user
export const fetchCheatSheets = async (): Promise<CheatSheetData[]> => {
  const user = await ensureAnonymousSession();
  
  const { data, error } = await supabase
    .from('cheat_sheets')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching cheat sheets:', error);
    throw error;
  }

  return data || [];
};

// Create a new cheat sheet
export const createCheatSheet = async (cheatSheetData: Omit<CheatSheetData, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CheatSheetData> => {
  const user = await ensureAnonymousSession();

  const { data, error } = await supabase
    .from('cheat_sheets')
    .insert({
      user_id: user.id,
      title: cheatSheetData.title,
      description: cheatSheetData.description,
      category: cheatSheetData.category,
      content: cheatSheetData.content,
      is_public: cheatSheetData.is_public || false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating cheat sheet:', error);
    throw error;
  }

  return data;
};

// Update an existing cheat sheet
export const updateCheatSheet = async (id: string, updates: Partial<Omit<CheatSheetData, 'id' | 'user_id' | 'created_at'>>): Promise<CheatSheetData> => {
  const user = await ensureAnonymousSession();

  const { data, error } = await supabase
    .from('cheat_sheets')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating cheat sheet:', error);
    throw error;
  }

  return data;
};

// Delete a cheat sheet
export const deleteCheatSheet = async (id: string): Promise<boolean> => {
  const user = await ensureAnonymousSession();

  const { error } = await supabase
    .from('cheat_sheets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting cheat sheet:', error);
    throw error;
  }

  return true;
};

// Get a single cheat sheet by ID
export const getCheatSheetById = async (id: string): Promise<CheatSheetData | null> => {
  const user = await ensureAnonymousSession();

  const { data, error } = await supabase
    .from('cheat_sheets')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching cheat sheet:', error);
    throw error;
  }

  return data;
};

// Migrate existing localStorage data to Supabase
export const migrateLocalStorageToSupabase = async () => {
  try {
    const localData = localStorage.getItem('cheatsheets');
    if (!localData) return;

    const sheets = JSON.parse(localData);
    const user = await ensureAnonymousSession();

    for (const sheet of sheets) {
      try {
        await supabase
          .from('cheat_sheets')
          .insert({
            user_id: user.id,
            title: sheet.title,
            description: sheet.description,
            category: sheet.category,
            content: sheet.content,
            is_public: sheet.isPublic || false,
          });
      } catch (error) {
        console.error('Error migrating sheet:', sheet.title, error);
      }
    }

    // Clear localStorage after successful migration
    localStorage.removeItem('cheatsheets');
    console.log('Successfully migrated localStorage data to Supabase');
  } catch (error) {
    console.error('Error during migration:', error);
  }
};