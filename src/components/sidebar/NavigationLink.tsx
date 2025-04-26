
import React, { ReactNode } from "react";
import { Link } from "react-router-dom";

interface NavigationLinkProps {
  to: string;
  icon: ReactNode;
  children: React.ReactNode;
  isActive: boolean;
}

export const NavigationLink = ({ to, icon, children, isActive }: NavigationLinkProps) => (
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
