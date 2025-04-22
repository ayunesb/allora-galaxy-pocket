
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
  Bell
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

const items = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Rocket, label: "Launch", path: "/launch" },
  { icon: BriefcaseBusiness, label: "Strategy", path: "/strategy" },
  { icon: BarChart2, label: "Campaigns", path: "/campaigns/center" },
  { icon: MessageSquare, label: "Assistant", path: "/assistant" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Lightbulb, label: "AI Coach", path: "/coaching/feed" },
  { icon: Palette, label: "Creative Suite", path: "/creative/suite" },
  { icon: Plus, label: "Add Plugin", path: "/admin/plugins/gallery" },
  { icon: UserPlus, label: "Invite Users", path: "/admin/invite" },
  { icon: Settings, label: "Settings", path: "/settings" }
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <span className="font-semibold text-lg">Allora OS</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <WorkspaceSwitcher />
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `w-full ${isActive ? 'data-[active=true]' : ''}`
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
