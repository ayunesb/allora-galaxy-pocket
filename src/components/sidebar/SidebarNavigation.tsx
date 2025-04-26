
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Layers,
  Wallet,
  Users,
  Building,
  BookOpen,
  CreditCard
} from "lucide-react";

interface NavigationLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
}

const NavigationLink = ({ to, icon, children, isActive }: NavigationLinkProps) => (
  <Link
    to={to}
    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
      isActive 
      ? "bg-primary/10 text-primary" 
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`}
  >
    <div className="mr-3 h-5 w-5">{icon}</div>
    {children}
  </Link>
);

export const MainNavigation = () => {
  const location = useLocation();
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="space-y-1">
      <NavigationLink 
        to="/dashboard"
        icon={<LayoutDashboard />}
        isActive={isActive("/dashboard")}
      >
        Dashboard
      </NavigationLink>
      
      <NavigationLink 
        to="/campaigns"
        icon={<FileText />}
        isActive={isActive("/campaigns")}
      >
        Campaigns
      </NavigationLink>
      
      <NavigationLink 
        to="/vault"
        icon={<Layers />}
        isActive={isActive("/vault")}
      >
        Strategy Vault
      </NavigationLink>
      
      <NavigationLink 
        to="/launch"
        icon={<Wallet />}
        isActive={isActive("/launch")}
      >
        Launch
      </NavigationLink>
      
      <NavigationLink 
        to="/agents"
        icon={<Users />}
        isActive={isActive("/agents")}
      >
        Agents
      </NavigationLink>
      
      <NavigationLink 
        to="/workspace"
        icon={<Building />}
        isActive={isActive("/workspace")}
      >
        Workspace
      </NavigationLink>
      
      <NavigationLink 
        to="/academy"
        icon={<BookOpen />}
        isActive={isActive("/academy")}
      >
        Academy
      </NavigationLink>
      
      <NavigationLink 
        to="/billing"
        icon={<CreditCard />}
        isActive={isActive("/billing")}
      >
        Billing
      </NavigationLink>
    </nav>
  );
};
