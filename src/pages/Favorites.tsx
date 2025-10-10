import { Link } from 'react-router-dom';
import { useCheatSheets } from '@/hooks/useCheatSheets';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, Star, MoreVertical, FileText, Folder } from 'lucide-react';
import { format } from 'date-fns';

const Favorites = () => {
  const { cheatSheets, isLoading, deleteCheatSheet, toggleFavorite } = useCheatSheets();
  const { toast } = useToast();

  const favoriteSheets = cheatSheets.filter(sheet => sheet.isFavorite);

  const handleDelete = async (id: string) => {
    try {
      await deleteCheatSheet(id);
      toast({
        title: "Success",
        description: "Cheat sheet deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete cheat sheet",
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string, customCategoryName?: string) => {
    if (customCategoryName) {
      return <span className="text-sm">🏷️</span>;
    }
    switch (category) {
      case 'mathematics': return <span className="text-sm">🧮</span>;
      case 'software': return <span className="text-sm">💻</span>;
      case 'coding': return <span className="text-sm">🧠</span>;
      case 'study': return <span className="text-sm">📚</span>;
      default: return <Folder className="h-4 w-4" />;
    }
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'mathematics': return { gradient: 'from-blue-500 to-blue-600' };
      case 'coding': return { gradient: 'from-purple-500 to-purple-600' };
      case 'software': return { gradient: 'from-green-500 to-green-600' };
      case 'study': return { gradient: 'from-orange-500 to-orange-600' };
      default: return { gradient: 'from-slate-500 to-slate-600' };
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your favorite cheat sheets...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Your Favorites</h1>
          <p className="text-sm text-muted-foreground">
            You have {favoriteSheets.length} favorite cheat sheet{favoriteSheets.length !== 1 ? 's' : ''}.
          </p>
        </div>

        {favoriteSheets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <div className="text-6xl mb-4">⭐️</div>
              <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
              <p className="mb-4">Click the star icon on a cheat sheet to add it to your favorites.</p>
              <Link to="/">
                <Button className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  Browse Cheat Sheets
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteSheets.map((sheet) => {
              const displayCategory = sheet.customCategory || sheet.category;
              const theme = getCategoryTheme(sheet.category);
              return (
                <Card key={sheet.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0">
                  <div className={`relative bg-gradient-to-br ${theme.gradient} p-6 min-h-[140px]`}>
                    <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-lg">
                      {getCategoryIcon(sheet.category, sheet.customCategory)}
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(sheet.id!, sheet.isFavorite || false);
                        }}
                      >
                        <Star className={`h-4 w-4 ${sheet.isFavorite ? 'text-yellow-300 fill-yellow-300' : ''}`} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/20">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Cheat Sheet</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{sheet.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(sheet.id!)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg line-clamp-1">{sheet.title}</h3>
                    {sheet.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">{sheet.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {displayCategory.charAt(0).toUpperCase() + displayCategory.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {sheet.content?.items?.length || 0} sections
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {(sheet.views || 0).toLocaleString()} views
                        </span>
                      </div>
                      <span>
                        {format(sheet.updatedAt instanceof Date ? sheet.updatedAt : (sheet.updatedAt as any).toDate ? (sheet.updatedAt as any).toDate() : new Date(), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Link to={`/?sheetId=${sheet.id}`} className="flex-1">
                        <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Link to={`/edit/${sheet.id}`} className="flex-1">
                        <Button size="sm" className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;