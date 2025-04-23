
import { NavLink } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface NavigationItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface SidebarNavigationGroupProps {
  label: string;
  items: NavigationItem[];
  show?: boolean;
}

export function SidebarNavigationGroup({ label, items, show = true }: SidebarNavigationGroupProps) {
  if (!show || items.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
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
  );
}
