
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
    { to: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard" },
    { to: "/campaigns", icon: <FileText />, label: "Campaigns" },
    { to: "/vault", icon: <Layers />, label: "Strategy Vault" },
    { to: "/launch", icon: <Wallet />, label: "Launch" },
    { to: "/agents", icon: <Users />, label: "Agents" },
    { to: "/workspace", icon: <Building />, label: "Workspace" },
    { to: "/academy", icon: <BookOpen />, label: "Academy" },
    { to: "/billing", icon: <CreditCard />, label: "Billing" }
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
