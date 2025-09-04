import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText, WifiOff, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Check Firestore connection
    const checkConnection = async () => {
      try {
        await getDocs(collection(db, 'cheatSheets'));
        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkConnection();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      checkConnection();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setIsConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {(!isOnline || !isConnected) && (
        <div className="bg-destructive/10 border-b border-destructive/20 p-3">
          <Alert className="border-destructive/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-destructive">
              {!isOnline 
                ? "No internet connection. Please connect to the internet to use this app."
                : "Unable to connect to the database. Please check your internet connection."
              }
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <header className="border-b border-border bg-gradient-to-r from-[hsl(var(--header-bg))] to-[hsl(var(--header-accent))] text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-white" />
              <h1 className="text-xl font-bold text-white">CheatSheet App</h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white">Dashboard</Button>
              </Link>
              <Link to="/create">
                <Button variant="ghost" className="gap-2 text-white hover:bg-white/20 hover:text-white">
                  <Plus className="h-4 w-4" />
                  Create
                </Button>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              {!isOnline || !isConnected && (
                <>
                  <WifiOff className="h-3 w-3 text-red-500" />
                  <span className="text-red-600">
                    {!isOnline ? 'No Internet' : 'Disconnected'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {(!isOnline || !isConnected) ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <WifiOff className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Connection Required</h2>
                <p className="text-muted-foreground max-w-md">
                  This application requires an active internet connection to function properly. 
                  Please check your connection and try again.
                </p>
              </div>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Retry Connection
              </Button>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
};

export default Layout;