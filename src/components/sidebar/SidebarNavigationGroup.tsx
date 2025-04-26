
import React, { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { SidebarSection, SidebarItem } from "@/components/ui/sidebar";
import { useSidebar } from "@/hooks/useSidebar";

interface NavigationItem {
  icon: ReactNode;
  label: string;
  path: string;
}

interface SidebarNavigationGroupProps {
  label: string;
  items: NavigationItem[];
  show?: boolean;
}

export function SidebarNavigationGroup({ label, items, show = true }: SidebarNavigationGroupProps) {
  const { collapsed } = useSidebar();
  
  if (!show || items.length === 0) return null;

  return (
    <SidebarSection title={collapsed ? undefined : label}>
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => "block no-underline"}
        >
          {({ isActive }) => (
            <SidebarItem
              isActive={isActive}
              icon={item.icon}
              label={item.label}
            />
          )}
        </NavLink>
      ))}
    </SidebarSection>
  );
}
