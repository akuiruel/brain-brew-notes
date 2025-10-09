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
    <Sidebar className={collapsed ? 'w-14' : 'w-60'}>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-sidebar-foreground truncate">CheatSheet</h2>
              <p className="text-xs text-muted-foreground truncate">Knowledge Base</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/" 
                    end
                    className={({ isActive }) => 
                      isActive 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                        : 'hover:bg-sidebar-accent/50'
                    }
                  >
                    <Home className="h-4 w-4" />
                    {!collapsed && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/favorites"
                    className={({ isActive }) => 
                      isActive 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                        : 'hover:bg-sidebar-accent/50'
                    }
                  >
                    <Star className="h-4 w-4" />
                    {!collapsed && <span>Favorites</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/recent"
                    className={({ isActive }) => 
                      isActive 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                        : 'hover:bg-sidebar-accent/50'
                    }
                  >
                    <Clock className="h-4 w-4" />
                    {!collapsed && <span>Recent</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/analytics"
                    className={({ isActive }) => 
                      isActive 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                        : 'hover:bg-sidebar-accent/50'
                    }
                  >
                    <BarChart3 className="h-4 w-4" />
                    {!collapsed && <span>Analytics</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>CATEGORIES</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="justify-between">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    {!collapsed && <span>All</span>}
                  </div>
                  {!collapsed && (
                    <Badge variant="secondary" className="text-xs">
                      {totalSheets}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {presetCategories.map((category) => {
                const count = getCategoryCount(category.id);
                return (
                  <SidebarMenuItem key={category.id}>
                    <SidebarMenuButton className="justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{category.icon}</span>
                        {!collapsed && <span>{category.name}</span>}
                      </div>
                      {!collapsed && count > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {count}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {customCategories.map((category) => {
                const count = getCustomCategoryCount(category.name);
                return (
                  <SidebarMenuItem key={category.id}>
                    <SidebarMenuButton className="justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{category.icon}</span>
                        {!collapsed && <span>{category.name}</span>}
                      </div>
                      {!collapsed && count > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {count}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              JD
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@example.com</p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
