// Firebase/Firestore type definitions
export interface CheatSheet {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: CheatSheetCategory;
  customCategory?: string;
  content: CheatSheetContent;
  isPublic: boolean;
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface CheatSheetContent {
  items: ContentItem[];
}

export interface ContentItem {
  id: string;
  type: 'text' | 'math' | 'code';
  content: string;
  title?: string;
  color?: string;
  isRead?: boolean;
}

export type CheatSheetCategory = 'mathematics' | 'software' | 'coding' | 'study' | 'other' | 'custom';

// Firestore document data (without id)
export type CheatSheetData = Omit<CheatSheet, 'id'>;

export interface CustomCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  userId: string;
  createdAt: Date | any;
}