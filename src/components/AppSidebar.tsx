import { FileText, Home, Star, Clock, BarChart3, Folder, Plus, Calculator, Laptop, Code, BookOpen, Layers } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCheatSheets } from '@/hooks/useCheatSheets';

const presetCategories = [
  { id: 'mathematics', name: 'Mathematics', icon: '🧮', color: 'bg-red-500' },
  { id: 'software', name: 'Software', icon: '💻', color: 'bg-blue-500' },
  { id: 'coding', name: 'Coding', icon: '🧠', color: 'bg-purple-500' },
  { id: 'study', name: 'Study', icon: '📚', color: 'bg-orange-500' },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { cheatSheets, customCategories } = useCheatSheets();

  const getCategoryCount = (categoryId: string) => {
    return cheatSheets.filter(sheet => sheet.category === categoryId).length;
  };

  const getCustomCategoryCount = (categoryName: string) => {
    return cheatSheets.filter(sheet => sheet.customCategory === categoryName).length;
  };

  const totalSheets = cheatSheets.length;
  const favoriteCount = cheatSheets.filter(sheet => sheet.isFavorite).length;
  const recentCount = cheatSheets.filter(sheet => sheet.lastViewedAt).length;

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-60'}>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-sidebar-foreground truncate">CheatSheet</h2>
              <p className="text-sm text-muted-foreground truncate">Knowledge Base</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {!collapsed && (
          <div className="px-4 py-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalSheets}</div>
                <div className="text-xs text-muted-foreground">Sheets</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{favoriteCount}</div>
                <div className="text-xs text-muted-foreground">Faved</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">{recentCount}</div>
                <div className="text-xs text-muted-foreground">Week</div>
              </div>
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-11">
                  <NavLink 
                    to="/" 
                    end
                    className={({ isActive }) => 
                      isActive 
                        ? 'bg-blue-600 text-white font-medium hover:bg-blue-700' 
                        : 'hover:bg-sidebar-accent/50'
                    }
                  >
                    <Home className="h-5 w-5" />
                    {!collapsed && (
                      <>
                        <span className="text-base flex-1">Dashboard</span>
                        <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-600 text-xs">3</Badge>
                      </>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-11">
                  <NavLink 
                    to="/favorites"
                    className={({ isActive }) => 
                      isActive 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                        : 'hover:bg-sidebar-accent/50'
                    }
                  >
                    <Star className="h-5 w-5" />
                    {!collapsed && (
                      <>
                        <span className="text-base flex-1">Favorites</span>
                        <Badge variant="secondary" className="text-xs">{favoriteCount}</Badge>
                      </>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-11">
                  <NavLink 
                    to="/recent"
                    className={({ isActive }) => 
                      isActive 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                        : 'hover:bg-sidebar-accent/50'
                    }
                  >
                    <Clock className="h-5 w-5" />
                    {!collapsed && <span className="text-base">Recent</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-11">
                  <NavLink 
                    to="/analytics"
                    className={({ isActive }) => 
                      isActive 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                        : 'hover:bg-sidebar-accent/50'
                    }
                  >
                    <BarChart3 className="h-5 w-5" />
                    {!collapsed && <span className="text-base">Analytics</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase text-muted-foreground px-3">Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-10">
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'hover:bg-sidebar-accent/50'
                    }
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Layers className="h-5 w-5" />
                        {!collapsed && <span className="text-base">All</span>}
                      </div>
                      {!collapsed && (
                        <Badge variant="secondary" className="text-xs">
                          {totalSheets}
                        </Badge>
                      )}
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {presetCategories.map((category) => {
                const count = getCategoryCount(category.id);
                return (
                  <SidebarMenuItem key={category.id}>
                    <SidebarMenuButton asChild className="h-10">
                      <NavLink
                        to={`/category/${category.id}`}
                        className={({ isActive }) =>
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'hover:bg-sidebar-accent/50'
                        }
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${category.color}`} />
                            {!collapsed && <span className="text-base">{category.name}</span>}
                          </div>
                          {!collapsed && count > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {count}
                            </Badge>
                          )}
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {customCategories.map((category) => {
                const count = getCustomCategoryCount(category.name);
                return (
                  <SidebarMenuItem key={category.id}>
                    <SidebarMenuButton asChild className="h-10">
                      <NavLink
                        to={`/category/custom-${category.id}`}
                        className={({ isActive }) =>
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'hover:bg-sidebar-accent/50'
                        }
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gray-400" />
                            {!collapsed && <span className="text-base">{category.name}</span>}
                          </div>
                          {!collapsed && count > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {count}
                            </Badge>
                          )}
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="px-4 pb-4 mt-auto">
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11">
              <Link to="/create">
                <Plus className="h-5 w-5 mr-2" />
                New Cheat Sheet
              </Link>
            </Button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
