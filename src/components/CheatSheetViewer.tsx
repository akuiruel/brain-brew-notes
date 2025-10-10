import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, FileText, BookmarkCheck, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import type { ContentItem } from '@/integrations/firebase/types';

interface CheatSheetViewerProps {
  title: string;
  description?: string;
  category: string;
  items: ContentItem[];
}

const CheatSheetViewer: React.FC<CheatSheetViewerProps> = ({
  title,
  description,
  category,
  items
}) => {
  const [readItems, setReadItems] = useState<Set<string>>(new Set());

  // Load read status from localStorage
  useEffect(() => {
    const savedReadItems = localStorage.getItem(`read-items-${title}`);
    if (savedReadItems) {
      setReadItems(new Set(JSON.parse(savedReadItems)));
    }
  }, [title]);

  // Save read status to localStorage
  const toggleReadStatus = (itemId: string) => {
    setReadItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
        toast.success('Marked as unread');
      } else {
        newSet.add(itemId);
        toast.success('Marked as read');
      }
      localStorage.setItem(`read-items-${title}`, JSON.stringify([...newSet]));
      return newSet;
    });
  };

  const handleCopyContent = (content: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    navigator.clipboard.writeText(textContent);
    toast.success('Content copied to clipboard');
  };

  const renderContentItem = (item: ContentItem, index: number) => {
    const isRead = readItems.has(item.id);
    
    return (
      <Card key={item.id} className={`overflow-hidden border-0 shadow-lg mb-6 transition-all ${isRead ? 'opacity-60' : ''}`}>
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white relative">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                    #{index + 1}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                    {item.type === 'text' && 'Text'}
                    {item.type === 'math' && 'Math'}
                    {item.type === 'code' && 'Coding'}
                  </Badge>
                  {isRead && (
                    <Badge variant="secondary" className="bg-green-500/80 text-white border-0 text-xs">
                      ✓ Read
                    </Badge>
                  )}
                </div>
                <h3 className="text-2xl font-bold">{item.title || 'Untitled'}</h3>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => toggleReadStatus(item.id)}
                title={isRead ? "Mark as unread" : "Mark as read"}
              >
                {isRead ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => handleCopyContent(item.content || '')}
              >
                <Copy className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-6 space-y-4">
          {item.type === 'text' && (
            <div className="space-y-4">
              <div 
                className="prose prose-sm max-w-none [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:mb-3 [&_ol]:mb-3 [&_li]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:flex [&_h3]:items-center [&_h3]:gap-2 [&_h3::before]:content-['>_'] [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:bg-blue-50 [&_blockquote]:dark:bg-blue-950/20 [&_blockquote]:p-4 [&_blockquote]:rounded-r-lg [&_blockquote]:my-4 [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_code]:text-sm [&_code]:font-mono"
                dangerouslySetInnerHTML={{ __html: item.content || "No content" }}
              />
            </div>
          )}
          
          {item.type === 'math' && (
            <div className="space-y-4">
              <div 
                className="prose prose-sm max-w-none [&_p]:mb-3 [&_p]:leading-relaxed [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:flex [&_h3]:items-center [&_h3]:gap-2 [&_h3::before]:content-['>_'] [&_blockquote]:border-l-4 [&_blockquote]:border-amber-500 [&_blockquote]:bg-amber-50 [&_blockquote]:dark:bg-amber-950/20 [&_blockquote]:p-4 [&_blockquote]:rounded-r-lg [&_blockquote]:my-4 [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_code]:text-sm [&_code]:font-mono"
                dangerouslySetInnerHTML={{ __html: item.content || "No content" }}
              />
            </div>
          )}
          
          {item.type === 'code' && (
            <div className="space-y-4">
              <div 
                className="prose prose-sm max-w-none [&_p]:mb-3 [&_p]:leading-relaxed [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:flex [&_h3]:items-center [&_h3]:gap-2 [&_h3::before]:content-['>_'] [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:bg-blue-50 [&_blockquote]:dark:bg-blue-950/20 [&_blockquote]:p-4 [&_blockquote]:rounded-r-lg [&_blockquote]:my-4 [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_code]:text-sm [&_code]:font-mono"
                dangerouslySetInnerHTML={{ __html: item.content || "No content" }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium mb-2">No content available</h3>
          <p>This cheat sheet doesn't have any content yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
            {description && (
              <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
            )}
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Content List */}
      <div className="max-w-4xl mx-auto">
        {items.map((item, index) => renderContentItem(item, index))}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-center gap-6 py-4 text-sm text-muted-foreground border-t">
        <div className="flex items-center gap-2">
          <span className="font-medium">{items.length}</span>
          <span>total sections</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{items.filter(item => item.type === 'code').length}</span>
          <span>code blocks</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{items.filter(item => item.type === 'math').length}</span>
          <span>math formulas</span>
        </div>
      </div>
    </div>
  );
};

export default CheatSheetViewer;