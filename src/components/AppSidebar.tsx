import { Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";
import WorkspaceSwitcher from "@/app/workspace/WorkspaceSwitcher";
import { useRouteAccess } from "@/hooks/useRouteAccess";
import { SidebarNavigationGroup } from "./sidebar/SidebarNavigationGroup";
import {
  dashboardItems,
  featureItems,
  adminItems,
  pluginItems
} from "@/config/navigation";
import { useUserRole } from "@/hooks/useUserRole";

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
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <span className="font-semibold text-lg">Allora OS</span>
      </SidebarHeader>
      <SidebarContent>
        <WorkspaceSwitcher />
        
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

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      `w-full ${isActive ? "data-[active=true]" : ""}`
                    }
                  >
                    <Settings />
                    <span>Settings</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
