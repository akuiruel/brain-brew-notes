import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus } from 'lucide-react';
import { useCheatSheets } from '@/hooks/useCheatSheets';

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

const CategoryManager = ({ onCategorySelect, selectedCategory, selectedCustomCategory }: Props) => {
  const { customCategories, saveCustomCategory, deleteCustomCategory } = useCheatSheets();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(presetColors[0]);
  const [icon, setIcon] = useState(presetIcons[0]);
  const [creating, setCreating] = useState(false);

  const resetForm = () => {
    setName('');
    setColor(presetColors[0]);
    setIcon(presetIcons[0]);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const created = await saveCustomCategory({ name: name.trim(), color, icon });
      // switch selection to custom and set the created id
      onCategorySelect('custom', created.id);
      setOpen(false);
      resetForm();
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteCustomCategory(id);
    if (selectedCategory === 'custom' && selectedCustomCategory === id) {
      onCategorySelect('other');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Custom Categories</Label>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cc-name">Name</Label>
                <Input id="cc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Algorithms" />
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
              <Button onClick={handleCreate} disabled={creating || !name.trim()}>
                {creating ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {customCategories.length === 0 ? (
          <div className="text-sm text-muted-foreground">No custom categories yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {customCategories.map((cat) => (
              <Card key={cat.id} className={`border ${selectedCustomCategory === cat.id ? 'ring-2 ring-offset-1 ring-black' : ''}`}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="flex items-center gap-3"
                      onClick={() => onCategorySelect('custom', cat.id)}
                    >
                      <div className="h-8 w-8 rounded flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                        <span className="text-sm">{cat.icon}</span>
                      </div>
                      <div className="text-sm font-medium">{cat.name}</div>
                    </button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(cat.id!)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

export default CategoryManager;