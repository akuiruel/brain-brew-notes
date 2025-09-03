import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  const renderContentItem = (item: ContentItem, index: number) => {
    return (
      <Card key={item.id} className="h-fit hover:shadow-md transition-shadow break-inside-avoid">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={`text-xs ${
                item.type === 'code' ? 'bg-green-50 text-green-700 border-green-200' :
                item.type === 'math' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {item.type === 'text' && '📝 Text'}
              {item.type === 'math' && '🧮 Math'}
              {item.type === 'code' && '💻 Code'}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">#{index + 1}</span>
          </div>
          {item.title && (
            <CardTitle className="text-sm font-semibold text-foreground leading-tight">
              {item.title}
            </CardTitle>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {item.type === 'text' && (
            <div 
              className="prose prose-sm max-w-none text-foreground [&_p]:mb-2 [&_p]:leading-relaxed [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-1 break-words"
              dangerouslySetInnerHTML={{ __html: item.content || "No content" }}
            />
          )}
          
          {item.type === 'math' && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <div 
                className="prose prose-sm max-w-none text-foreground [&_p]:mb-2 [&_p]:leading-relaxed break-words"
                dangerouslySetInnerHTML={{ __html: item.content || "No content" }}
              />
            </div>
          )}
          
          {item.type === 'code' && (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div 
                className="text-slate-800 dark:text-slate-200 [&_p]:mb-2 [&_p]:leading-relaxed [&_span]:text-blue-600 [&_span]:dark:text-blue-400 whitespace-pre-wrap break-words"
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

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
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