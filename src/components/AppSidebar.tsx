import { FileText, Home, Star, Clock, BarChart3, Folder } from 'lucide-react';
import { NavLink } from 'react-router-dom';
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
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useCheatSheets } from '@/hooks/useCheatSheets';

const presetCategories = [
  { id: 'mathematics', name: 'Mathematics', icon: '🧮' },
  { id: 'software', name: 'Software', icon: '💻' },
  { id: 'coding', name: 'Coding', icon: '🧠' },
  { id: 'study', name: 'Study', icon: '📚' },
  { id: 'other', name: 'Other', icon: '🏷️' },
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

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'}>
      <SidebarHeader className="border-b border-sidebar-border p-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground truncate">CheatSheet</h2>
              <p className="text-xs text-muted-foreground truncate">Your Knowledge Base</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/" 
                    end
                    className="bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                  >
                    <Home className="h-5 w-5" />
                    {!collapsed && <span className="text-sm font-medium">Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/favorites"
                    className={({ isActive }) => 
                      isActive 
                        ? 'bg-primary text-primary-foreground font-medium hover:bg-primary/90' 
                        : 'hover:bg-sidebar-accent text-sidebar-foreground'
                    }
                  >
                    <Star className="h-5 w-5" />
                    {!collapsed && <span className="text-sm font-medium text-sidebar-foreground">Favorites</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/recent"
                    className={({ isActive }) => 
                      isActive 
                        ? 'bg-primary text-primary-foreground font-medium hover:bg-primary/90' 
                        : 'hover:bg-sidebar-accent text-sidebar-foreground'
                    }
                  >
                    <Clock className="h-5 w-5" />
                    {!collapsed && <span className="text-sm font-medium text-sidebar-foreground">Recent</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-3 mb-2">CATEGORIES</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/category/all"
                    className="bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        {!collapsed && <span className="text-sm font-medium">All</span>}
                      </div>
                      {!collapsed && (
                        <Badge variant="secondary" className="text-xs bg-primary-foreground/20 text-primary-foreground">
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
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={`/category/${category.id}`}
                        className={({ isActive }) =>
                          isActive
                            ? 'bg-primary text-primary-foreground font-medium hover:bg-primary/90'
                            : 'hover:bg-sidebar-accent text-sidebar-foreground'
                        }
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{category.icon}</span>
                            {!collapsed && <span className="text-sm font-medium text-sidebar-foreground">{category.name}</span>}
                          </div>
                          {!collapsed && count > 0 && (
                            <Badge variant="secondary" className="text-xs bg-muted">
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
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={`/category/custom-${category.id}`}
                        className={({ isActive }) =>
                          isActive
                            ? 'bg-primary text-primary-foreground font-medium hover:bg-primary/90'
                            : 'hover:bg-sidebar-accent text-sidebar-foreground'
                        }
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{category.icon}</span>
                            {!collapsed && <span className="text-sm font-medium text-sidebar-foreground">{category.name}</span>}
                          </div>
                          {!collapsed && count > 0 && (
                            <Badge variant="secondary" className="text-xs bg-muted">
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
      </SidebarContent>
    </Sidebar>
  );
}
