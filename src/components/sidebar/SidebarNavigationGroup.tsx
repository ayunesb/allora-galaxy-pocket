
import { NavLink } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { SidebarSection, SidebarItem } from "@/components/ui/sidebar";
import { useSidebar } from "@/hooks/useSidebar";

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
              icon={<item.icon className="h-4 w-4" />}
              label={item.label}
            />
          )}
        </NavLink>
      ))}
    </SidebarSection>
  );
}
