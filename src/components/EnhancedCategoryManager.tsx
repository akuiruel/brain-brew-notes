import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, Edit2 } from 'lucide-react';
import { useCheatSheets } from '@/hooks/useCheatSheets';
import { useToast } from '@/hooks/use-toast';

type Props = {
  onCategorySelect: (selected: string, customId?: string) => void;
  selectedCategory: string;
  selectedCustomCategory?: string;
};

const presetColors = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#a855f7', // purple
  '#64748b', // slate
];

const presetIcons = ['📘', '🧠', '💻', '📚', '🧮', '🔧', '🧪', '🎯', '🏷️', '⭐️'];

// Define preset categories with icons and colors
const presetCategories = [
  { id: 'mathematics', name: 'Mathematics', icon: '🧮', color: '#3b82f6' },
  { id: 'software', name: 'Software', icon: '💻', color: '#10b981' },
  { id: 'coding', name: 'Coding', icon: '🧠', color: '#8b5cf6' },
  { id: 'study', name: 'Study', icon: '📚', color: '#f59e0b' },
  { id: 'other', name: 'Other', icon: '🏷️', color: '#64748b' },
];

const EnhancedCategoryManager = ({ onCategorySelect, selectedCategory, selectedCustomCategory }: Props) => {
  const { customCategories, saveCustomCategory, deleteCustomCategory } = useCheatSheets();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(presetColors[0]);
  const [icon, setIcon] = useState(presetIcons[0]);
  const [creating, setCreating] = useState(false);

  const resetForm = () => {
    setName('');
    setColor(presetColors[0]);
    setIcon(presetIcons[0]);
    setEditingCategory(null);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const created = await saveCustomCategory({ name: name.trim(), color, icon });
      onCategorySelect('custom', created.id);
      setOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Custom category created successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create custom category",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setName(category.name);
    setColor(category.color);
    setIcon(category.icon);
    setOpen(true);
  };

  const handleUpdate = async () => {
    if (!name.trim() || !editingCategory) return;
    setCreating(true);
    try {
      // For preset categories, create a new custom category with the updated values
      if (editingCategory.isPreset) {
        const created = await saveCustomCategory({ name: name.trim(), color, icon });
        onCategorySelect('custom', created.id);
        toast({
          title: "Success",
          description: "Category customized successfully!",
        });
      } else {
        // For custom categories, we would need an update function
        // For now, delete old and create new
        await deleteCustomCategory(editingCategory.id);
        const created = await saveCustomCategory({ name: name.trim(), color, icon });
        onCategorySelect('custom', created.id);
        toast({
          title: "Success",
          description: "Custom category updated successfully!",
        });
      }
      setOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (category: any) => {
    if (category.isPreset) {
      toast({
        title: "Cannot Delete",
        description: "Preset categories cannot be deleted. You can create a custom version instead.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteCustomCategory(category.id);
      if (selectedCategory === 'custom' && selectedCustomCategory === category.id) {
        onCategorySelect('other');
      }
      toast({
        title: "Success",
        description: "Custom category deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete custom category",
        variant: "destructive",
      });
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setOpen(true);
  };

  // Combine preset and custom categories for display
  const allCategories = [
    ...presetCategories.map(cat => ({ ...cat, isPreset: true })),
    ...customCategories.map(cat => ({ ...cat, isPreset: false }))
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>All Categories</Label>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" /> New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 
                  (editingCategory.isPreset ? 'Customize Category' : 'Edit Custom Category') : 
                  'Create Custom Category'
                }
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cc-name">Name</Label>
                <Input 
                  id="cc-name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Algorithms" 
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-8 w-8 rounded border ${color === c ? 'ring-2 ring-offset-1 ring-black' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {presetIcons.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`h-8 w-8 rounded border bg-white flex items-center justify-center text-lg ${icon === ic ? 'ring-2 ring-offset-1 ring-black' : ''}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={editingCategory ? handleUpdate : handleCreate} 
                disabled={creating || !name.trim()}
              >
                {creating ? 'Processing...' : (editingCategory ? 'Update' : 'Create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {allCategories.length === 0 ? (
          <div className="text-sm text-muted-foreground">No categories available.</div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {allCategories.map((cat) => (
              <Card 
                key={cat.isPreset ? `preset-${cat.id}` : `custom-${cat.id}`} 
                className={`border ${
                  (cat.isPreset && selectedCategory === cat.id) || 
                  (!cat.isPreset && selectedCustomCategory === cat.id) 
                    ? 'ring-2 ring-offset-1 ring-primary' : ''
                }`}
              >
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="flex items-center gap-3 flex-1"
                      onClick={() => cat.isPreset 
                        ? onCategorySelect(cat.id) 
                        : onCategorySelect('custom', cat.id)
                      }
                    >
                      <div 
                        className="h-8 w-8 rounded flex items-center justify-center text-white" 
                        style={{ backgroundColor: cat.color }}
                      >
                        <span className="text-sm">{cat.icon}</span>
                      </div>
                      <div className="text-sm font-medium">{cat.name}</div>
                      {cat.isPreset && (
                        <span className="text-xs bg-muted px-2 py-1 rounded">Preset</span>
                      )}
                    </button>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleEdit(cat)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleDelete(cat)}
                        disabled={cat.isPreset}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCategoryManager;