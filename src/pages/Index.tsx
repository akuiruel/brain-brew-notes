import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Plus, Edit, Trash2, Eye, Search, FileText, TrendingUp, Star, Zap, Filter, MoreVertical, Folder } from 'lucide-react';
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
  const { cheatSheets, isLoading, isOnline, deleteCheatSheet, customCategories } = useCheatSheets();
  const { toast } = useToast();
  const [selectedSheet, setSelectedSheet] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'viewer'>('grid');

  const filteredSheets = cheatSheets.filter(sheet => {
    const matchesSearch = sheet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sheet.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCategory = categoryFilter === 'all';
    if (!matchesCategory) {
      if (categoryFilter.startsWith('custom-')) {
        const customCategoryId = categoryFilter.replace('custom-', '');
        const customCat = customCategories.find(cat => cat.id === customCategoryId);
        matchesCategory = sheet.customCategory === customCat?.name;
      } else {
        matchesCategory = sheet.category === categoryFilter;
      }
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
        headerBg: 'from-primary/5 to-primary/10', 
        iconBg: 'bg-primary', 
        border: 'border-primary/20',
        customColor: color
      };
    }
    
    switch (category) {
      case 'mathematics':
        return { headerBg: 'from-blue-50 to-blue-100', iconBg: 'bg-blue-600', border: 'border-blue-200' };
      case 'coding':
        return { headerBg: 'from-green-50 to-emerald-100', iconBg: 'bg-emerald-600', border: 'border-emerald-200' };
      case 'software':
        return { headerBg: 'from-purple-50 to-fuchsia-100', iconBg: 'bg-purple-600', border: 'border-purple-200' };
      case 'study':
        return { headerBg: 'from-orange-50 to-amber-100', iconBg: 'bg-amber-600', border: 'border-amber-200' };
      default:
        return { headerBg: 'from-slate-50 to-slate-100', iconBg: 'bg-slate-600', border: 'border-slate-200' };
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
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setViewMode('grid');
                setSelectedSheet(null);
              }}
            >
              ← Back to Grid
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <div className="flex gap-2 w-full sm:w-auto">
                <Link to={`/edit/${selectedSheet.id}`} className="flex-1 sm:flex-none">
                  <Button variant="outline" className="gap-2 w-full">
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <CheatSheetViewer
            title={selectedSheet.title}
            description={selectedSheet.description}
            category={selectedSheet.category}
            items={selectedSheet.content?.items || []}
          />
        </div>
      </Layout>
    );
  }

  const totalViews = cheatSheets.reduce((acc, sheet) => acc + (sheet.content?.items?.length || 0) * 100, 0);
  const favoriteCount = cheatSheets.filter(sheet => sheet.category === 'mathematics').length;
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
        <div>
          <h1 className="text-3xl font-bold mb-1">Welcome back, John! 👋</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your cheat sheets today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  +12%
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{cheatSheets.length}</p>
                <p className="text-sm text-muted-foreground">Total Sheets</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  +23%
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{(totalViews / 1000).toFixed(1)}K</p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  +8%
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{favoriteCount}</p>
                <p className="text-sm text-muted-foreground">Favorites</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-green-500 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  +2
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{thisWeekCount}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cheat sheets by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Your Cheat Sheets Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Your Cheat Sheets</h2>
              <p className="text-sm text-muted-foreground">
                Showing {filteredSheets.length} of {cheatSheets.length} sheets
              </p>
            </div>
            <Link to="/create">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create New
              </Button>
            </Link>
          </div>

          {filteredSheets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              {cheatSheets.length === 0 ? (
                <>
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium mb-2">No cheat sheets yet</h3>
                  <p className="mb-4">Create your first cheat sheet to get started!</p>
                  <Link to="/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Cheat Sheet
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium mb-2">No results found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSheets.map((sheet) => {
              const displayCategory = sheet.customCategory || sheet.category;
              const theme = getCategoryTheme(sheet.category, sheet.customCategory);
              return (
                <Card key={sheet.id} className="hover:shadow-lg transition-shadow group">
                  <CardHeader className="pb-3">
                    <div className={`rounded-xl p-4 bg-gradient-to-br ${theme.headerBg} border ${theme.border}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-white ${theme.iconBg}`}>
                              {getCategoryIcon(sheet.category, sheet.customCategory)}
                            </div>
                            <CardTitle className="text-lg font-semibold truncate">
                              {sheet.title}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getCategoryColor(sheet.category, sheet.customCategory)}`}
                            >
                              <span className="mr-1">
                                {getCategoryIcon(sheet.category, sheet.customCategory)}
                              </span>
                              {displayCategory.charAt(0).toUpperCase() + displayCategory.slice(1)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {sheet.content?.items?.length || 0} sections
                            </span>
                          </div>
                        </div>
                      </div>
                      {sheet.description && (
                        <p className="text-sm text-slate-700 line-clamp-2 mt-3">
                          {sheet.description}
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Updated {format(sheet.updatedAt instanceof Date ? sheet.updatedAt : (sheet.updatedAt as any).toDate ? (sheet.updatedAt as any).toDate() : new Date(), 'MMM d, yyyy')}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedSheet(sheet);
                            setViewMode('viewer');
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Link to={`/edit/${sheet.id}`}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
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