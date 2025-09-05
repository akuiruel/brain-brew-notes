import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCheatSheets } from '@/hooks/useCheatSheets';

type Props = {
  value: string;
  onValueChange: (value: string, customId?: string) => void;
  placeholder?: string;
  selectedCustomCategory?: string;
};

// Define preset categories with icons and colors
const presetCategories = [
  { id: 'mathematics', name: 'Mathematics', icon: '🧮', color: '#3b82f6' },
  { id: 'software', name: 'Software', icon: '💻', color: '#10b981' },
  { id: 'coding', name: 'Coding', icon: '🧠', color: '#8b5cf6' },
  { id: 'study', name: 'Study', icon: '📚', color: '#f59e0b' },
  { id: 'other', name: 'Other', icon: '🏷️', color: '#64748b' },
];

const CategoryDropdown = ({ value, onValueChange, placeholder = "Select category", selectedCustomCategory }: Props) => {
  const { customCategories } = useCheatSheets();

  const handleValueChange = (selectedValue: string) => {
    if (selectedValue.startsWith('custom-')) {
      const customId = selectedValue.replace('custom-', '');
      onValueChange('custom', customId);
    } else {
      onValueChange(selectedValue);
    }
  };

  const getDisplayValue = () => {
    if (value === 'custom' && selectedCustomCategory) {
      const customCat = customCategories.find(cat => cat.id === selectedCustomCategory);
      if (customCat) {
        return (
          <div className="flex items-center gap-2">
            <span>{customCat.icon}</span>
            <span>{customCat.name}</span>
          </div>
        );
      }
    }
    
    const presetCat = presetCategories.find(cat => cat.id === value);
    if (presetCat) {
      return (
        <div className="flex items-center gap-2">
          <span>{presetCat.icon}</span>
          <span>{presetCat.name}</span>
        </div>
      );
    }

    return placeholder;
  };

  const currentValue = value === 'custom' && selectedCustomCategory 
    ? `custom-${selectedCustomCategory}` 
    : value;

  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {getDisplayValue()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {/* Preset categories */}
        {presetCategories.map((cat) => (
          <SelectItem key={cat.id} value={cat.id}>
            <div className="flex items-center gap-2">
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </div>
          </SelectItem>
        ))}
        
        {/* Custom categories */}
        {customCategories.length > 0 && (
          <>
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t">
              Custom Categories
            </div>
            {customCategories.map((cat) => (
              <SelectItem key={`custom-${cat.id}`} value={`custom-${cat.id}`}>
                <div className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </div>
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  );
};

export default CategoryDropdown;