// Firebase/Firestore type definitions
export interface CheatSheet {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: CheatSheetCategory;
  content: CheatSheetContent;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
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
}

export type CheatSheetCategory = 'mathematics' | 'software' | 'coding' | 'study' | 'other';

// Firestore document data (without id)
export type CheatSheetData = Omit<CheatSheet, 'id'>;