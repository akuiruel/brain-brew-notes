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
import { Plus, Edit, Trash2, Eye, Search, Download, FileText, Calculator, Code, BookOpen, Folder } from 'lucide-react';
import { exportToPDF } from '@/utils/pdfExport';
import { format } from 'date-fns';

const Index = () => {
  const { cheatSheets, isLoading, isOnline, deleteCheatSheet } = useCheatSheets();
  const { toast } = useToast();
  const [selectedSheet, setSelectedSheet] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'viewer'>('grid');
  const [pdfColumns, setPdfColumns] = useState<2 | 3>(3);

  const filteredSheets = cheatSheets.filter(sheet => {
    const matchesSearch = sheet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sheet.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || sheet.category === categoryFilter;
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

  const handleExportPDF = async (sheet: any) => {
    try {
      await exportToPDF(sheet, { columns: pdfColumns });
      toast({
        title: "Success",
        description: "PDF exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mathematics': return <Calculator className="h-4 w-4" />;
      case 'coding': return <Code className="h-4 w-4" />;
      case 'software': return <FileText className="h-4 w-4" />;
      case 'study': return <BookOpen className="h-4 w-4" />;
      default: return <Folder className="h-4 w-4" />;
    }
  };

  const getCustomCategoryIcon = (customCategoryName?: string) => {
    if (!customCategoryName) return <Folder className="h-4 w-4" />;
    const customCat = cheatSheets.find(sheet => sheet.customCategory === customCategoryName);
    // For now, return a default icon since we don't store icon in the cheat sheet
    return <span className="text-sm">🏷️</span>;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mathematics': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'coding': return 'bg-green-100 text-green-800 border-green-200';
      case 'software': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'study': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryTheme = (category: string) => {
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
            <div className="flex gap-2 items-center">
              <Select value={String(pdfColumns)} onValueChange={(v) => setPdfColumns(v === '2' ? 2 : 3)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="PDF Columns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => handleExportPDF(selectedSheet)}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
              <Link to={`/edit/${selectedSheet.id}`}>
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Cheat Sheets</h1>
            <p className="text-muted-foreground">
              {filteredSheets.length} of {cheatSheets.length} cheat sheets
            </p>
          </div>
          <Link to="/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create New
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cheat sheets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="mathematics">Mathematics</SelectItem>
              <SelectItem value="software">Software</SelectItem>
              <SelectItem value="coding">Coding</SelectItem>
              <SelectItem value="study">Study</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(pdfColumns)} onValueChange={(v) => setPdfColumns(v === '2' ? 2 : 3)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="PDF Columns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 Columns</SelectItem>
              <SelectItem value="3">3 Columns</SelectItem>
            </SelectContent>
          </Select>
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
              const theme = getCategoryTheme(sheet.category);
              return (
                <Card key={sheet.id} className="hover:shadow-lg transition-shadow group">
                  <CardHeader className="pb-3">
                    <div className={`rounded-xl p-4 bg-gradient-to-br ${theme.headerBg} border ${theme.border}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-white ${theme.iconBg}`}>
                              {sheet.customCategory ? getCustomCategoryIcon(sheet.customCategory) : getCategoryIcon(sheet.category)}
                            </div>
                            <CardTitle className="text-lg font-semibold truncate">
                              {sheet.title}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getCategoryColor(sheet.customCategory ? 'other' : sheet.category)}`}
                            >
                              <span className="mr-1">
                                {sheet.customCategory ? getCustomCategoryIcon(sheet.customCategory) : getCategoryIcon(sheet.category)}
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
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleExportPDF(sheet)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
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
    </Layout>
  );
};

export default Index;