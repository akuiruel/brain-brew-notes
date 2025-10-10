import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, FileText, BookmarkCheck, Bookmark, ArrowLeft, Star, Share2, MoreVertical, Eye, Calendar, FileStack } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { ContentItem } from '@/integrations/firebase/types';

interface CheatSheetViewerProps {
  title: string;
  description?: string;
  category: string;
  items: ContentItem[];
  views: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const CheatSheetViewer: React.FC<CheatSheetViewerProps> = ({
  title,
  description,
  category,
  items,
  views,
  isFavorite,
  onToggleFavorite
}) => {
  const navigate = useNavigate();
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
      <div className="flex flex-col items-center md:flex-row md:items-start gap-6 pb-6">
        {/* Icon */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg flex-shrink-0">
          <FileText className="w-12 h-12 text-white" strokeWidth={2.5} />
        </div>

        {/* Title and Info */}
        <div className="flex-1 min-w-0 text-center md:text-left">
          {/* Category Badges */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-0">
              Coding
            </Badge>
            <Badge className="bg-purple-500 hover:bg-purple-600 text-white border-0">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
            <Badge className="bg-purple-500 hover:bg-purple-600 text-white border-0">
              Basics
            </Badge>
            <Badge className="bg-purple-500 hover:bg-purple-600 text-white border-0">
              Tutorial
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground mb-4">{title}</h1>

          {/* Stats */}
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-purple-600">
              <Eye className="w-4 h-4" />
              <span className="font-medium">{(views || 0).toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Updated Oct 2, 2025</span>
            </div>
            <div className="flex items-center gap-2 text-pink-600">
              <FileStack className="w-4 h-4" />
              <span className="font-medium">{items.length} sections</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="icon"
            variant="outline"
            className={`rounded-lg ${isFavorite ? 'bg-yellow-50 text-yellow-600 border-yellow-300' : ''}`}
            onClick={() => {
              onToggleFavorite();
              toast.success(!isFavorite ? 'Added to favorites' : 'Removed from favorites');
            }}
          >
            <Star className={`w-5 h-5 ${isFavorite ? 'fill-yellow-600' : ''}`} />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="rounded-lg"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Link copied to clipboard');
            }}
          >
            <Share2 className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="rounded-lg"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
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