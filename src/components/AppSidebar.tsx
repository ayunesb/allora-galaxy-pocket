
import { NavLink } from "react-router-dom";
import { 
  Home, 
  Rocket, 
  BriefcaseBusiness, 
  BarChart2, 
  Settings,
  UserPlus,
  Lightbulb,
  Palette,
  MessageSquare,
  Bell,
  Bot,
  PlusCircle,
  Send,
  List,
  Shield,
  DollarSign,
  Star,
  Database,
  Search,
  AlertTriangle
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import WorkspaceSwitcher from "@/app/workspace/WorkspaceSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

// Helper function to check if the user can access a route based on their role
function canAccessRoute(role, path) {
  if (!role) return false;
  
  const accessMatrix = {
    client: [
      "/dashboard", 
      "/strategy-gen", 
      "/vault", 
      "/startup", 
      "/campaigns/center", 
      "/insights/kpis", 
      "/launch", 
      "/assistant", 
      "/notifications", 
      "/creative/suite"
    ],
    developer: [
      "/dashboard", 
      "/plugins/builder", 
      "/agents/performance", 
      "/creative/suite", 
      "/startup", 
      "/campaigns/center"
    ],
    admin: ["*"]
  };
  
  return (
    accessMatrix[role]?.includes(path) ||
    accessMatrix[role]?.includes("*") ||
    path.startsWith("/settings") // Everyone can access settings
  );
}

export function AppSidebar() {
  const { user } = useAuth();
  const { role } = useUserRole();
  
  // Define sidebar items by category
  const dashboardItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: BarChart2, label: "Insights", path: "/dashboard/insights" },
    { icon: BarChart2, label: "Performance", path: "/dashboard/performance" },
    { icon: BarChart2, label: "KPIs", path: "/dashboard/kpi" },
    { icon: BarChart2, label: "Team Activity", path: "/dashboard/team-activity" },
    { icon: AlertTriangle, label: "Incidents", path: "/dashboard/incidents" },
    { icon: Bell, label: "Alerts", path: "/dashboard/alerts" },
    { icon: Home, label: "Startup", path: "/dashboard/startup" },
  ];

  const featureItems = [
    { icon: Rocket, label: "Launch", path: "/launch" },
    { icon: BriefcaseBusiness, label: "Strategy", path: "/strategy" },
    { icon: BarChart2, label: "Campaigns", path: "/campaigns/center" },
    { icon: MessageSquare, label: "Assistant", path: "/assistant" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: Lightbulb, label: "AI Coach", path: "/coaching/feed" },
    { icon: Bot, label: "Agents", path: "/agents" },
    { icon: Palette, label: "Creative Suite", path: "/creative/suite" },
  ];

  const adminItems = [
    { icon: Shield, label: "Admin Review", path: "/admin/plugins/review" },
    { icon: DollarSign, label: "Plugin Earnings", path: "/admin/plugins/earnings" },
    { icon: PlusCircle, label: "Add Plugin", path: "/admin/plugins/gallery" },
    { icon: UserPlus, label: "Invite Users", path: "/admin/invite" },
    { icon: Database, label: "Agent Memory", path: "/admin/agents/memory" },
    { icon: Search, label: "Agent Collab", path: "/admin/agents/collaboration" },
  ];

  const pluginItems = [
    { icon: Settings, label: "Plugin Settings", path: "/plugins/settings" },
    { icon: PlusCircle, label: "Plugin Marketplace", path: "/plugins/explore" },
    { icon: List, label: "My Plugins", path: "/plugins/my" },
    { icon: Send, label: "Submit Plugin", path: "/plugins/submit" },
    { icon: DollarSign, label: "Revenue Share", path: "/plugins/revenue/apply" },
    { icon: Star, label: "Plugin Builder", path: "/plugins/builder" },
    { icon: Star, label: "Publish to Galaxy", path: "/galaxy/create" },
  ];

  // Filter items based on user role permissions
  const filteredDashboardItems = dashboardItems.filter(item => 
    canAccessRoute(role, item.path)
  );

  const filteredFeatureItems = featureItems.filter(item => 
    canAccessRoute(role, item.path)
  );

  const filteredAdminItems = adminItems.filter(item => 
    canAccessRoute(role, item.path)
  );
  
  const filteredPluginItems = pluginItems.filter(item => 
    canAccessRoute(role, item.path)
  );

  // Show settings at the bottom for all users
  const settingsItem = { icon: Settings, label: "Settings", path: "/settings" };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <span className="font-semibold text-lg">Allora OS</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <WorkspaceSwitcher />
        </SidebarGroup>
        
        {/* Dashboard navigation - always show if user has access to any items */}
        {filteredDashboardItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredDashboardItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `w-full ${isActive ? "data-[active=true]" : ""}`
                        }
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        
        {/* Core features navigation */}
        {filteredFeatureItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Features</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredFeatureItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `w-full ${isActive ? "data-[active=true]" : ""}`
                        }
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        
        {/* Admin section - only show if user has admin access */}
        {role === 'admin' && filteredAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdminItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `w-full ${isActive ? "data-[active=true]" : ""}`
                        }
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        
        {/* Plugins section */}
        {filteredPluginItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Plugins</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredPluginItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `w-full ${isActive ? "data-[active=true]" : ""}`
                        }
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings (always accessible) */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={settingsItem.label}>
                  <NavLink
                    to={settingsItem.path}
                    className={({ isActive }) =>
                      `w-full ${isActive ? "data-[active=true]" : ""}`
                    }
                  >
                    <settingsItem.icon />
                    <span>{settingsItem.label}</span>
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
