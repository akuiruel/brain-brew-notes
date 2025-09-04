import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheatSheets } from '@/hooks/useCheatSheets';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RichTextEditor from '@/components/RichTextEditor';
import MathRichTextEditor from '@/components/MathRichTextEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash2, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import type { ContentItem, CheatSheetCategory } from '@/integrations/firebase/types';
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const moveItem = <T,>(array: T[], fromIndex: number, toIndex: number): T[] => {
  const newArray = array.slice();
  const [moved] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, moved);
  return newArray;
};

const SortableItem = ({
  item,
  index,
  length,
  onRemove,
  onMoveTo,
  updateContentItem,
}: {
  item: ContentItem;
  index: number;
  length: number;
  onRemove: (id: string) => void;
  onMoveTo: (id: string, newPositionOneBased: number) => void;
  updateContentItem: (id: string, updates: Partial<ContentItem>) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style: any = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef as any} style={style} className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="cursor-grab" {...attributes} {...listeners}>
              <GripVertical className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {item.type === 'text' && 'Text'}
              {item.type === 'math' && 'Math Formula'}
              {item.type === 'code' && 'Code'}
            </span>
            <span className="text-xs text-muted-foreground">#{index + 1}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onMoveTo(item.id, Math.max(1, index))} disabled={index === 0}>
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onMoveTo(item.id, Math.min(length, index + 2))} disabled={index === length - 1}>
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Select value={String(index + 1)} onValueChange={(v) => onMoveTo(item.id, parseInt(v, 10))}>
              <SelectTrigger className="w-16">
                <SelectValue placeholder="Pos" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length }).map((_, i) => (
                  <SelectItem key={i} value={String(i + 1)}>{i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={() => onRemove(item.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Title (optional)</Label>
          <Input
            value={item.title || ''}
            onChange={(e) => updateContentItem(item.id, { title: e.target.value })}
            placeholder="Enter section title"
          />
        </div>
        {item.type === 'text' && (
          <div>
            <Label>Content</Label>
            <RichTextEditor
              value={item.content}
              onChange={(content) => updateContentItem(item.id, { content })}
              placeholder="Enter text content with color formatting"
              className="mt-2"
            />
          </div>
        )}
        {item.type === 'math' && (
          <div>
            <Label>Content</Label>
            <MathRichTextEditor
              value={item.content}
              onChange={(content) => updateContentItem(item.id, { content })}
              placeholder="Enter math formulas and text..."
              className="mt-2"
            />
          </div>
        )}
        {item.type === 'code' && (
          <div>
            <Label>Content</Label>
            <RichTextEditor
              value={item.content}
              onChange={(content) => updateContentItem(item.id, { content })}
              placeholder="Enter code..."
              className="mt-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
const CreateCheatSheet = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveCheatSheet, isOnline } = useCheatSheets();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CheatSheetCategory | ''>('');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const displayItems = contentItems;
  const handlePositionChange = (id: string, newPositionOneBased: number) => {
    const oldIndex = displayItems.findIndex((i) => i.id === id);
    const newIndex = Math.max(0, Math.min(displayItems.length - 1, newPositionOneBased - 1));
    if (oldIndex === -1 || oldIndex === newIndex) return;
    const newDisplay = moveItem(displayItems, oldIndex, newIndex);
    setContentItems(newDisplay);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = displayItems.findIndex((i) => i.id === active.id);
    const newIndex = displayItems.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setContentItems(moveItem(displayItems, oldIndex, newIndex));
  };

  if (!isOnline) {
    return <Layout><div /></Layout>;
  }
  const addContentItem = (type: 'text' | 'math' | 'code') => {
    const newItem: ContentItem = {
      id: crypto.randomUUID(),
      type,
      content: '',
      title: '',
      color: '#000000',
    };
    setContentItems(prev => [...prev, newItem]);
  };

  const updateContentItem = (id: string, updates: Partial<ContentItem>) => {
    setContentItems(prev => 
      prev.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  };

  const removeContentItem = (id: string) => {
    setContentItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your cheat sheet",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const cheatSheetData = {
        title: title.trim(),
        description: description.trim(),
        category: category as CheatSheetCategory,
        content: { items: contentItems },
        isPublic: false,
      };

      console.log('Saving cheat sheet data:', cheatSheetData);
      await saveCheatSheet(cheatSheetData);

      toast({
        title: "Success",
        description: "Cheat sheet created successfully!",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error creating cheat sheet:', error);
      
      // More detailed error message
      let errorMessage = 'Failed to create cheat sheet';
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          errorMessage = 'Permission denied. Please check if you are signed in and have the correct permissions.';
        } else if (error.message.includes('network-request-failed')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Create New Cheat Sheet</h1>
          <Button onClick={handleSave} disabled={isLoading} className="gap-2">
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter cheat sheet title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={(value) => setCategory(value as CheatSheetCategory)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="coding">Coding</SelectItem>
                      <SelectItem value="study">Study</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description (optional)"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => addContentItem('text')}
                  className="w-full justify-start gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Text
                </Button>
                <Button
                  variant="outline"
                  onClick={() => addContentItem('math')}
                  className="w-full justify-start gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Math Formula
                </Button>
                <Button
                  variant="outline"
                  onClick={() => addContentItem('code')}
                  className="w-full justify-start gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Code
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                {contentItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No content added yet. Use the buttons on the left to add content.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={displayItems.map((i) => i.id)}>
                        {displayItems.map((item, index) => (
                          <SortableItem
                            key={item.id}
                            item={item}
                            index={index}
                            length={displayItems.length}
                            onRemove={removeContentItem}
                            onMoveTo={handlePositionChange}
                            updateContentItem={updateContentItem}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCheatSheet;