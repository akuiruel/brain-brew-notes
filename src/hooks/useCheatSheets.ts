import { useContext } from 'react';
import { CheatSheetContext } from '@/contexts/CheatSheetProvider';

export const useCheatSheets = () => {
  const context = useContext(CheatSheetContext);
  if (context === undefined) {
    throw new Error('useCheatSheets must be used within a CheatSheetProvider');
  }
  return context;
};