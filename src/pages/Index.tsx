import { useState } from 'react';
import { useCheatSheets } from '@/hooks/useCheatSheets';

  const deleteCheatSheet = async (id: string) => {
    try {
      await deleteCheatSheetData(id);
      
      toast({
        title: "Success",
        description: "Cheat sheet deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting cheat sheet:', error);
      toast({
        title: "Error",
        description: "Failed to delete cheat sheet",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = async (sheet: CheatSheetData) => {
    try {
      await exportToPDF({
        title: sheet.title,
        description: sheet.description,
        category: sheet.category,
        content: sheet.content || { items: [] },
      });
      toast({
        title: "Success",
        description: "PDF exported successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    }
  };


  const renderContentPreview = (sheet: CheatSheetData) => {
    if (!sheet.content?.items || sheet.content.items.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No content available
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sheet.content.items.map((item, index) => (
          <Card key={item.id} className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {item.type === 'text' && 'Text'}
                  {item.type === 'math' && 'Math'}
                  {item.type === 'code' && 'Code'}
                </Badge>
                <span className="text-xs text-muted-foreground">#{index + 1}</span>
              </div>
              {item.title && (
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {item.type === 'text' && (
                <div 
                  className="prose prose-sm max-w-none text-foreground [&_p]:mb-2 [&_p]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: item.content || "No content" }}
                />
              )}
              
              {item.type === 'math' && (
                <div 
                  className="prose prose-sm max-w-none text-foreground [&_p]:mb-2 [&_p]:leading-relaxed bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md border border-amber-200 dark:border-amber-800"
                  dangerouslySetInnerHTML={{ __html: item.content || "No content" }}
                />
              )}
              
              {item.type === 'code' && (
                <div className="bg-slate-950 text-green-400 p-3 rounded-md border font-mono text-sm">
                  <div 
                    className="[&_p]:mb-1 [&_p]:leading-relaxed [&_span]:text-green-400"
                    dangerouslySetInnerHTML={{ __html: item.content || "No content" }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Cheat Sheets</h1>
            <p className="text-muted-foreground">
              Create and manage your personal cheat sheets
            </p>
          </div>
          <div className="flex items-center gap-2">
            {viewMode === 'preview' && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setViewMode('list');
                  setSelectedSheet(null);
                }}
              >
                Back to List
              </Button>
            )}
            <Link to="/create">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create New
              </Button>
            </Link>
          </div>
        </div>

        {viewMode === 'preview' && selectedSheet ? (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedSheet.title}</h2>
                  {selectedSheet.description && (
                    <p className="text-muted-foreground mt-1">{selectedSheet.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedSheet.category}</Badge>
                  <Link to={`/edit/${selectedSheet.id}`}>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExportPDF(selectedSheet)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </div>
            {renderContentPreview(selectedSheet)}
          </div>
        ) : isLoading ? (
          <div className="text-center py-8">Loading your cheat sheets...</div>
        ) : cheatSheets.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No cheat sheets yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first cheat sheet to get started
            </p>
            <Link to="/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Cheat Sheet
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cheatSheets.map((sheet) => (
              <Card key={sheet.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{sheet.title}</CardTitle>
                      <Badge variant="secondary" className="w-fit">
                        {sheet.category}
                      </Badge>
                    </div>
                  </div>
                  {sheet.description && (
                    <CardDescription>{sheet.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Updated {new Date(sheet.updated_at || '').toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setSelectedSheet(sheet);
                          setViewMode('preview');
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Link to={`/edit/${sheet.id}`}>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleExportPDF(sheet)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => deleteCheatSheet(sheet.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

export default Index;