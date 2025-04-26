
import React from "react";
import { useLocation } from "react-router-dom";
import { NavigationLink } from "./NavigationLink";
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

export const MainNavigation = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const navigationItems = [
    { to: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/campaigns", icon: <FileText size={20} />, label: "Campaigns" },
    { to: "/vault", icon: <Layers size={20} />, label: "Strategy Vault" },
    { to: "/launch", icon: <Wallet size={20} />, label: "Launch" },
    { to: "/agents", icon: <Users size={20} />, label: "Agents" },
    { to: "/workspace", icon: <Building size={20} />, label: "Workspace" },
    { to: "/academy", icon: <BookOpen size={20} />, label: "Academy" },
    { to: "/billing", icon: <CreditCard size={20} />, label: "Billing" }
  ];

  return (
    <nav className="space-y-1">
      {navigationItems.map((item) => (
        <NavigationLink
          key={item.to}
          to={item.to}
          icon={item.icon}
          isActive={isActive(item.to)}
        >
          {item.label}
        </NavigationLink>
      ))}
    </nav>
  );
};
