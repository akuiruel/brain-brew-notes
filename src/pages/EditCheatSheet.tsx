import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCheatSheetById, updateCheatSheet } from '@/lib/storage';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RichTextEditor from '@/components/RichTextEditor';
import MathRichTextEditor from '@/components/MathRichTextEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash2 } from 'lucide-react';
import type { ContentItem, CheatSheetCategory } from '@/integrations/firebase/types';

const EditCheatSheet = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CheatSheetCategory | ''>('');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCheatSheet();
    }
  }, [id]);

  const fetchCheatSheet = async () => {
    try {
      const data = getCheatSheetById(id!);

      if (!data) {
        toast({
          title: "Error",
          description: "Cheat sheet not found",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setTitle(data.title);
      setDescription(data.description || '');
      setCategory(data.category);
      setContentItems(data.content?.items || []);
    } catch (error) {
      console.error('Error fetching cheat sheet:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cheat sheet",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setIsFetching(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
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
      const success = updateCheatSheet(id!, {
        title: title.trim(),
        description: description.trim(),
        category: category as CheatSheetCategory,
        content: { items: contentItems },
      });

      if (success) {
        toast({
          title: "Success",
          description: "Cheat sheet updated successfully!",
        });
        
        navigate('/');
      } else {
        throw new Error('Failed to update cheat sheet');
      }
    } catch (error) {
      console.error('Error updating cheat sheet:', error);
      toast({
        title: "Error",
        description: "Failed to update cheat sheet",
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
          <h1 className="text-3xl font-bold">Edit Cheat Sheet</h1>
          <Button onClick={handleSave} disabled={isLoading} className="gap-2">
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
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
                  <Select value={category} onValueChange={setCategory}>
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
                    {contentItems.map((item, index) => (
                      <Card key={item.id} className="relative">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {item.type === 'text' && 'Text'}
                                {item.type === 'math' && 'Math Formula'}
                                {item.type === 'code' && 'Code'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                #{index + 1}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeContentItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                              <div className="mt-2 p-3 border rounded-md bg-muted/50">
                                <Label className="text-xs text-muted-foreground">Preview:</Label>
                                <div 
                                  className="prose prose-sm max-w-none text-foreground"
                                  dangerouslySetInnerHTML={{ __html: item.content || "Type content to see preview..." }}
                                />
                              </div>
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
                              <div className="mt-2 p-3 border rounded-md bg-muted/50">
                                <Label className="text-xs text-muted-foreground">Preview:</Label>
                                <div 
                                  className="prose prose-sm max-w-none text-foreground"
                                  dangerouslySetInnerHTML={{ __html: item.content || "Type content to see preview..." }}
                                />
                              </div>
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
                              <div className="mt-2 p-3 border rounded-md bg-slate-950 text-green-400">
                                <Label className="text-xs text-slate-400">Preview:</Label>
                                <div 
                                  className="prose prose-sm max-w-none font-mono text-green-400 [&_p]:text-green-400 [&_span]:text-green-400"
                                  dangerouslySetInnerHTML={{ __html: item.content || "Type content to see preview..." }}
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
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

export default EditCheatSheet;