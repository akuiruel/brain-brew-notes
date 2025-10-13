import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCheatSheets } from '@/hooks/useCheatSheets';
import Layout from '@/components/Layout';
import CheatSheetViewer from '@/components/CheatSheetViewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, Search, FileText, TrendingUp, Star, Zap, Filter, MoreVertical, Folder, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

// Define preset categories
const presetCategories = [
  { id: 'mathematics', name: 'Mathematics', icon: '🧮', color: '#3b82f6' },
  { id: 'software', name: 'Software', icon: '💻', color: '#10b981' },
  { id: 'coding', name: 'Coding', icon: '🧠', color: '#8b5cf6' },
  { id: 'study', name: 'Study', icon: '📚', color: '#f59e0b' },
  { id: 'other', name: 'Other', icon: '🏷️', color: '#64748b' },
];

const Index = () => {
  const { categoryId } = useParams();
  const { cheatSheets, isLoading, isOnline, deleteCheatSheet, customCategories, incrementView, toggleFavorite } = useCheatSheets();
  const { toast } = useToast();
  const [selectedSheet, setSelectedSheet] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'viewer'>('grid');

  const filteredSheets = cheatSheets.filter(sheet => {
    const matchesSearch = sheet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sheet.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!categoryId || categoryId === 'all') {
      return matchesSearch;
    }

    let matchesCategory = false;
    if (categoryId.startsWith('custom-')) {
      const customCategoryId = categoryId.replace('custom-', '');
      const customCat = customCategories.find(cat => cat.id === customCategoryId);
      matchesCategory = sheet.customCategory === customCat?.name;
    } else {
      matchesCategory = sheet.category === categoryId;
    }
    
    return matchesSearch && matchesCategory;
  });

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
      const customCat = customCategories.find(cat => cat.name === customCategoryName);
      return customCat ? <span className="text-sm">{customCat.icon}</span> : <span className="text-sm">🏷️</span>;
    }
    
    const presetCat = presetCategories.find(cat => cat.id === category);
    return presetCat ? <span className="text-sm">{presetCat.icon}</span> : <Folder className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string, customCategoryName?: string) => {
    if (customCategoryName) {
      return 'bg-primary/10 text-primary border-primary/20';
    }
    
    switch (category) {
      case 'mathematics': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'coding': return 'bg-green-100 text-green-800 border-green-200';
      case 'software': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'study': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryTheme = (category: string, customCategoryName?: string) => {
    if (customCategoryName) {
      const customCat = customCategories.find(cat => cat.name === customCategoryName);
      const color = customCat?.color || '#64748b';
      return { 
        gradient: 'from-slate-500 to-slate-600',
        customColor: color
      };
    }
    
    switch (category) {
      case 'mathematics':
        return { gradient: 'from-blue-500 to-blue-600' };
      case 'coding':
        return { gradient: 'from-purple-500 to-purple-600' };
      case 'software':
        return { gradient: 'from-green-500 to-green-600' };
      case 'study':
        return { gradient: 'from-orange-500 to-orange-600' };
      default:
        return { gradient: 'from-slate-500 to-slate-600' };
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your cheat sheets...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isOnline) {
    return <Layout><div /></Layout>;
  }
  if (viewMode === 'viewer' && selectedSheet) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setViewMode('grid');
                setSelectedSheet(null);
              }}
              className="bg-blue-500 text-white hover:bg-blue-600 border-blue-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Grid
            </Button>
            <div className="flex gap-2">
              <Link to={`/edit/${selectedSheet.id}`} className="flex-1">
                <Button variant="default" className="gap-2 w-full bg-purple-500 text-white hover:bg-purple-600">
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              </Link>
            </div>
          </div>
          
          <CheatSheetViewer
            title={selectedSheet.title}
            description={selectedSheet.description}
            category={selectedSheet.category}
            items={selectedSheet.content?.items || []}
            views={selectedSheet.views}
            isFavorite={selectedSheet.isFavorite}
            onToggleFavorite={() => toggleFavorite(selectedSheet.id!, selectedSheet.isFavorite)}
          />
        </div>
      </Layout>
    );
  }

  const totalViews = cheatSheets.reduce((acc, sheet) => acc + (sheet.views || 0), 0);
  const favoriteCount = cheatSheets.filter(sheet => sheet.isFavorite).length;
  const thisWeekCount = cheatSheets.filter(sheet => {
    const sheetDate = sheet.updatedAt instanceof Date ? sheet.updatedAt : (sheet.updatedAt as any).toDate ? (sheet.updatedAt as any).toDate() : new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sheetDate >= weekAgo;
  }).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your cheat sheets efficiently</p>
          </div>
          <Link to="/create">
            <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg">
              <Plus className="h-4 w-4" />
              New Sheet
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Sheets</p>
                  <p className="text-3xl font-bold text-foreground">{cheatSheets.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Favorites</p>
                  <p className="text-3xl font-bold text-foreground">{favoriteCount}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">This Week</p>
                  <p className="text-3xl font-bold text-foreground">{thisWeekCount}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cheat sheets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-0 bg-secondary/50 focus-visible:ring-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Your Cheat Sheets Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Cheat Sheets</h2>
              <p className="text-sm text-muted-foreground">
                {filteredSheets.length} entries
              </p>
            </div>
          </div>

          {filteredSheets.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="text-center py-16">
              <div className="text-muted-foreground">
                {cheatSheets.length === 0 ? (
                  <>
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">No cheat sheets yet</h3>
                    <p className="mb-6 text-sm">Create your first cheat sheet to get started!</p>
                    <Link to="/create">
                      <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-md">
                        <Plus className="h-4 w-4" />
                        Create Your First Cheat Sheet
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">No results found</h3>
                    <p className="text-sm">Try adjusting your search criteria</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredSheets.map((sheet) => {
              const displayCategory = sheet.customCategory || sheet.category;
              return (
                <Card key={sheet.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Number badge */}
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary-foreground">
                            {filteredSheets.indexOf(sheet) + 1}
                          </span>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0 flex-shrink">
                          <h3 className="font-semibold text-base text-foreground mb-1 truncate">
                            {sheet.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{format(sheet.updatedAt instanceof Date ? sheet.updatedAt : (sheet.updatedAt as any).toDate(), 'dd/MM/yyyy')}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {sheet.views || 0}
                            </span>
                          </div>
                          
                          {/* Description preview */}
                          {sheet.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                              {sheet.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Action buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            incrementView(sheet.id!);
                            setSelectedSheet(sheet);
                            setViewMode('viewer');
                          }}
                          data-testid={`view-button-${sheet.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Link to={`/edit/${sheet.id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleFavorite(sheet.id!, sheet.isFavorite || false)}
                        >
                          <Star className={`h-4 w-4 ${sheet.isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
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
                              <AlertDialogAction
                                onClick={() => handleDelete(sheet.id!)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
};

export default Index;