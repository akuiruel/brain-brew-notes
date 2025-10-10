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
import { Save, Plus, Trash2, ArrowUp, ArrowDown, GripVertical, FileText, Code2, Calculator } from 'lucide-react';
import type { ContentItem, CheatSheetCategory } from '@/integrations/firebase/types';
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import EnhancedCategoryManager from '@/components/EnhancedCategoryManager';
import CategoryDropdown from '@/components/CategoryDropdown';

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
  const { saveCheatSheet, isOnline, customCategories } = useCheatSheets();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CheatSheetCategory | ''>('');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customCategoryId, setCustomCategoryId] = useState<string>('');
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

    if (!category && !customCategoryId) {
      toast({
        title: "Error",
        description: "Please select a category or create a custom one",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let finalCategory: CheatSheetCategory;
      let customCategoryName: string | undefined;
      
      if (category === 'custom' && customCategoryId) {
        finalCategory = 'other'; // Use 'other' as base category for custom ones
        const customCat = customCategories.find(cat => cat.id === customCategoryId);
        customCategoryName = customCat?.name;
      } else {
        finalCategory = category as CheatSheetCategory;
      }

      const cheatSheetData = {
        title: title.trim(),
        description: description.trim(),
        category: finalCategory,
        customCategory: customCategoryName,
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

  const handleCategorySelect = (selectedCat: string, customId?: string) => {
    setCategory(selectedCat as CheatSheetCategory);
    if (selectedCat === 'custom' && customId) {
      setCustomCategoryId(customId);
    } else {
      setCustomCategoryId('');
    }
  };

  const presetCategories = [
    { id: 'mathematics', name: 'Mathematics', icon: Calculator, color: 'bg-blue-500' },
    { id: 'coding', name: 'Coding', icon: Code2, color: 'bg-purple-500' },
    { id: 'study', name: 'Study', icon: FileText, color: 'bg-orange-500' },
    { id: 'health', name: 'Health', icon: FileText, color: 'bg-green-500' },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Create New Cheat Sheet</h1>
            <Button onClick={handleSave} disabled={isLoading} className="gap-2">
              <Save className="h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel */}
            <div className="space-y-6">
              {/* Basic Information Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Basic Information</CardTitle>
                      <p className="text-xs text-muted-foreground">Set up your cheat sheet details</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="flex items-center gap-1 text-xs font-medium mb-2">
                      <span className="text-destructive">*</span> Title
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter cheat sheet title..."
                      className="bg-background"
                    />
                  </div>
                  
                  <div>
                    <Label className="flex items-center gap-1 text-xs font-medium mb-2">
                      <span className="text-destructive">*</span> Category
                    </Label>
                    <p className="text-xs text-muted-foreground mb-3">Select a category or create a new one</p>
                    
                    {/* All Categories Button */}
                    <Button
                      variant="outline"
                      className="w-full justify-between mb-2 bg-background"
                      onClick={() => setCategory('')}
                    >
                      <span className="text-sm">All Categories</span>
                      <Badge variant="secondary" className="text-xs">
                        {customCategories.length + presetCategories.length} total
                      </Badge>
                    </Button>

                    {/* Preset Categories */}
                    <div className="space-y-2">
                      {presetCategories.map((cat) => (
                        <Button
                          key={cat.id}
                          variant={category === cat.id ? "default" : "outline"}
                          className="w-full justify-between bg-background"
                          onClick={() => handleCategorySelect(cat.id, '')}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded ${cat.color} flex items-center justify-center`}>
                              <cat.icon className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm">{cat.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">Preset</Badge>
                        </Button>
                      ))}
                    </div>

                    {/* Custom Categories */}
                    {customCategories.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Custom Categories</p>
                        {customCategories.map((cat) => (
                          <Button
                            key={cat.id}
                            variant={customCategoryId === cat.id ? "default" : "outline"}
                            className="w-full justify-between bg-background"
                            onClick={() => handleCategorySelect('custom', cat.id)}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                <FileText className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm">{cat.name}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Category Manager */}
                    <div className="mt-3">
                      <EnhancedCategoryManager 
                        onCategorySelect={handleCategorySelect}
                        selectedCategory={category}
                        selectedCustomCategory={customCategoryId}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-xs font-medium mb-2 block">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter description (optional)..."
                      rows={4}
                      className="bg-background resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Add Content Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Add Content</CardTitle>
                      <p className="text-xs text-muted-foreground">Build your cheat sheet with blocks</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => addContentItem('text')}
                    className="w-full justify-start gap-3 h-auto py-3 bg-background"
                  >
                    <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium">Add Text Block</p>
                      <p className="text-xs text-muted-foreground">Plain text content</p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addContentItem('code')}
                    className="w-full justify-start gap-3 h-auto py-3 bg-background"
                  >
                    <div className="w-8 h-8 rounded bg-purple-500 flex items-center justify-center flex-shrink-0">
                      <Code2 className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium">Add Code Block</p>
                      <p className="text-xs text-muted-foreground">Code snippets with syntax</p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addContentItem('math')}
                    className="w-full justify-start gap-3 h-auto py-3 bg-background"
                  >
                    <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Calculator className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium">Add Math Formula</p>
                      <p className="text-xs text-muted-foreground">Mathematical expressions</p>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Content Area */}
            <div>
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Content</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {contentItems.length === 0 ? 'No content yet' : `${contentItems.length} block${contentItems.length > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {contentItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                      <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-purple-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No content added yet</h3>
                      <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                        Use the buttons on the left to add text, code, or formulas to your cheat sheet
                      </p>
                      <div className="flex gap-2 flex-wrap justify-center">
                        <Button size="sm" variant="outline" onClick={() => addContentItem('text')} className="gap-2">
                          <Plus className="h-3 w-3" />
                          Add Text
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => addContentItem('code')} className="gap-2">
                          <Plus className="h-3 w-3" />
                          Add Code
                        </Button>
                      </div>
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
      </div>
    </Layout>
  );
};

export default CreateCheatSheet;