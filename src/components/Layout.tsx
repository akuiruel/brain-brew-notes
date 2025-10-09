import { ReactNode } from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col w-full">
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
          
          <header className="border-b border-border bg-background">
            <div className="flex items-center gap-4 px-6 py-4">
              <SidebarTrigger />
              {!isOnline || !isConnected && (
                <div className="flex items-center gap-1 text-xs ml-auto">
                  <WifiOff className="h-3 w-3 text-red-500" />
                  <span className="text-red-600">
                    {!isOnline ? 'No Internet' : 'Disconnected'}
                  </span>
                </div>
              )}
            </div>
          </header>
          
          <main className="flex-1 overflow-auto px-6 py-8">
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
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;