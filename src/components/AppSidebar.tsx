
import { NavLink } from "react-router-dom";
import { 
  Home, 
  Rocket, 
  BriefcaseBusiness, 
  BarChart2, 
  Settings,
  UserPlus,
  Lightbulb,
  Plus,
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

function canAccessRoute(role, path) {
  const accessMatrix = {
    client: ["/dashboard", "/strategy-gen", "/vault", "/startup", "/campaigns/center", "/insights/kpis", "/launch", "/assistant", "/notifications", "/creative/suite"],
    developer: ["/dashboard", "/plugins/builder", "/agents/performance", "/creative/suite", "/startup", "/campaigns/center"],
    admin: ["*"]
  };
  return (
    accessMatrix[role]?.includes(path) ||
    accessMatrix[role]?.includes("*")
  );
}

const items = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: BarChart2, label: "Insights", path: "/dashboard/insights" },
  { icon: BarChart2, label: "Performance", path: "/dashboard/performance" },
  { icon: BarChart2, label: "KPIs", path: "/dashboard/kpi" },
  { icon: BarChart2, label: "Team Activity", path: "/dashboard/team-activity" },
  { icon: AlertTriangle, label: "Incidents", path: "/dashboard/incidents" },
  { icon: Bell, label: "Alerts", path: "/dashboard/alerts" },
  { icon: Home, label: "Startup", path: "/dashboard/startup" },
  { icon: Rocket, label: "Launch", path: "/launch" },
  { icon: BriefcaseBusiness, label: "Strategy", path: "/strategy" },
  { icon: BarChart2, label: "Campaigns", path: "/campaigns/center" },
  { icon: MessageSquare, label: "Assistant", path: "/assistant" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Lightbulb, label: "AI Coach", path: "/coaching/feed" },
  { icon: Bot, label: "Agents", path: "/agents" },
  { icon: Palette, label: "Creative Suite", path: "/creative/suite" },
  { icon: Shield, label: "Admin Review", path: "/admin/plugins/review" },
  { icon: Plus, label: "Plugin Earnings", path: "/admin/plugins/earnings" },
  { icon: Plus, label: "Add Plugin", path: "/admin/plugins/gallery" },
  { icon: UserPlus, label: "Invite Users", path: "/admin/invite" },
  { icon: Settings, label: "Plugin Settings", path: "/plugins/settings" },
  { 
    icon: PlusCircle, 
    label: "Plugin Marketplace", 
    path: "/plugins/explore" 
  },
  { 
    icon: List, 
    label: "My Plugins", 
    path: "/plugins/my" 
  },
  { 
    icon: Send, 
    label: "Submit Plugin", 
    path: "/plugins/submit" 
  },
  {
    icon: DollarSign,
    label: "Revenue Share Apply",
    path: "/plugins/revenue/apply"
  },
  {
    icon: Star,
    label: "Plugin Builder",
    path: "/plugins/builder"
  },
  {
    icon: Star,
    label: "Publish to Galaxy",
    path: "/galaxy/create"
  },
  { 
    icon: Database, 
    label: "Agent Memory", 
    path: "/admin/agents/memory" 
  },
  { 
    icon: Search, 
    label: "Agent Collab", 
    path: "/admin/agents/collaboration" 
  },
  { 
    icon: Settings, 
    label: "Settings", 
    path: "/settings" 
  }
];

// Group items by category
const dashboardItems = items.filter(item => item.path.startsWith('/dashboard'));
const featureItems = items.filter(item => 
  !item.path.startsWith('/dashboard') && 
  !item.path.startsWith('/admin') && 
  !item.path.startsWith('/plugins')
);
const adminItems = items.filter(item => item.path.startsWith('/admin'));
const pluginItems = items.filter(item => item.path.startsWith('/plugins'));

export function AppSidebar() {
  const { user } = useAuth();
  const { role } = useUserRole();

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <span className="font-semibold text-lg">Allora OS</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <WorkspaceSwitcher />
        </SidebarGroup>
        
        {/* Dashboard navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardItems
                .filter(item => canAccessRoute(role, item.path))
                .map((item) => (
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
        
        {/* Core features navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {featureItems
                .filter(item => canAccessRoute(role, item.path))
                .map((item) => (
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
        
        {/* Admin section - only show if user has admin access */}
        {role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems
                  .filter(item => canAccessRoute(role, item.path))
                  .map((item) => (
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
        <SidebarGroup>
          <SidebarGroupLabel>Plugins</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {pluginItems
                .filter(item => canAccessRoute(role, item.path))
                .map((item) => (
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
      </SidebarContent>
    </Sidebar>
  );
}
