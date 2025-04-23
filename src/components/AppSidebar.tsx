
import { Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";
import { SidebarNavigationGroup } from "./sidebar/SidebarNavigationGroup";
import { useRouteAccess } from "@/hooks/useRouteAccess";
import { useUserRole } from "@/hooks/useUserRole";
import { SidebarErrorBoundary } from "./sidebar/SidebarErrorBoundary";
import {
  dashboardItems,
  featureItems,
  adminItems,
  pluginItems
} from "@/config/navigation";

export function AppSidebar() {
  const { canAccessRoute } = useRouteAccess();
  const { role } = useUserRole();

  const filteredDashboardItems = dashboardItems.filter(item => 
    canAccessRoute(item.path)
  );

  const filteredFeatureItems = featureItems.filter(item => 
    canAccessRoute(item.path)
  );

  const filteredAdminItems = adminItems.filter(item => 
    canAccessRoute(item.path)
  );
  
  const filteredPluginItems = pluginItems.filter(item => 
    canAccessRoute(item.path)
  );

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="flex items-center justify-center py-4">
        <h3 className="text-lg font-bold">Allora OS</h3>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarErrorBoundary>
          <SidebarNavigationGroup 
            label="Dashboard" 
            items={filteredDashboardItems}
            show={filteredDashboardItems.length > 0} 
          />
          
          <SidebarNavigationGroup 
            label="Features" 
            items={filteredFeatureItems}
            show={filteredFeatureItems.length > 0} 
          />
          
          <SidebarNavigationGroup 
            label="Admin" 
            items={filteredAdminItems}
            show={role === 'admin' && filteredAdminItems.length > 0} 
          />
          
          <SidebarNavigationGroup 
            label="Plugins" 
            items={filteredPluginItems}
            show={filteredPluginItems.length > 0} 
          />
        </SidebarErrorBoundary>
      </SidebarContent>
      
      <SidebarFooter>
        <NavLink to="/settings" className={({ isActive }) =>
          `flex items-center gap-2 rounded-md p-2 text-sm ${
            isActive ? "bg-accent text-accent-foreground" : ""
          }`
        }>
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
}
