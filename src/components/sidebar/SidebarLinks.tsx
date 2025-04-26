
import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  CreditCard, 
  Settings, 
  User, 
  Database 
} from "lucide-react";
import { useSidebar } from '@/hooks/useSidebar';

interface SidebarLinkProps {
  to: string;
  icon: ReactNode;
  children: ReactNode;
  isActive: boolean;
}

const SidebarLink = ({ to, icon, children, isActive }: SidebarLinkProps) => {
  const { collapsed } = useSidebar();
  
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
        isActive 
        ? "bg-primary/10 text-primary" 
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <div className="mr-3 h-5 w-5">{icon}</div>
      {!collapsed && children}
    </Link>
  );
};

export const AccountLinks = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="mt-1">
      <SidebarLink 
        to="/settings" 
        icon={<Settings size={20} />}
        isActive={isActive("/settings")}
      >
        Settings
      </SidebarLink>
      
      <SidebarLink 
        to="/profile" 
        icon={<User size={20} />}
        isActive={isActive("/profile")}
      >
        Profile
      </SidebarLink>
    </div>
  );
};

export const AdminLinks = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="mt-1">
      <SidebarLink 
        to="/admin/settings" 
        icon={<Settings size={20} />}
        isActive={isActive("/admin/settings")}
      >
        Admin Settings
      </SidebarLink>
      
      <SidebarLink 
        to="/admin/security-audit" 
        icon={<Database size={20} />}
        isActive={isActive("/admin/security-audit")}
      >
        Security Audit
      </SidebarLink>
    </div>
  );
};
