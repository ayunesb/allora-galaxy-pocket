
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useSidebar } from '@/hooks/useSidebar';

interface MainNavigationItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  isActive: boolean;
}

const MainNavigationItem = ({ to, icon, label, isActive }: MainNavigationItemProps) => {
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
      {!collapsed && <span>{label}</span>}
    </Link>
  );
};

export default MainNavigationItem;
