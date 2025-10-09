import { useCheatSheets } from '@/hooks/useCheatSheets';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Eye, Edit, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';

const Recent = () => {
  const { cheatSheets, isLoading } = useCheatSheets();

  // The useCheatSheets hook already sorts by updatedAt descending
  const recentSheets = cheatSheets.slice(0, 15); // Show the 15 most recent

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your recent cheat sheets...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Recent</h1>
          <p className="text-muted-foreground">
            Your most recently updated cheat sheets.
          </p>
        </div>

        {recentSheets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <div className="text-6xl mb-4">🕒</div>
              <h3 className="text-lg font-medium mb-2">No recent cheat sheets</h3>
              <p>Create or update a cheat sheet to see it here.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentSheets.map((sheet) => (
              <Card key={sheet.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {sheet.title}
                  </h3>
                  {sheet.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                      {sheet.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {sheet.customCategory || sheet.category}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {sheet.content?.items?.length || 0} sections
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(sheet.updatedAt instanceof Date ? sheet.updatedAt : (sheet.updatedAt as any).toDate ? (sheet.updatedAt as any).toDate() : new Date(), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link to={`/?sheet=${sheet.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Link to={`/edit/${sheet.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Recent;