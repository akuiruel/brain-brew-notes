import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Download, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToPDF } from '@/utils/pdfExport';

interface CheatSheet {
  id: string;
  title: string;
  description: string;
  category: string;
  content: any;
  created_at: string;
  updated_at: string;
}

const Index = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [cheatSheets, setCheatSheets] = useState<CheatSheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCheatSheets();
    }
  }, [user]);

  const fetchCheatSheets = async () => {
    try {
      const { data, error } = await supabase
        .from('cheat_sheets')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setCheatSheets(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch cheat sheets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCheatSheet = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cheat_sheets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCheatSheets(prev => prev.filter(sheet => sheet.id !== id));
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

  const handleExportPDF = async (sheet: CheatSheet) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

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
          <Link to="/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create New
            </Button>
          </Link>
        </div>

        {isLoading ? (
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
                      Updated {new Date(sheet.updated_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
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
