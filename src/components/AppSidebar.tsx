
import React from 'react';
import { 
  ScrollArea 
} from "@/components/ui/scroll-area";
import { useSidebar } from '@/hooks/useSidebar';

// Fix className props
interface SidebarContainerProps {
  children: React.ReactNode;
}

const SidebarContainer: React.FC<SidebarContainerProps & React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
  const { collapsed } = useSidebar();
  
  return (
    <div className={`h-screen flex flex-col bg-card border-r transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} ${className}`} {...props}>
      {children}
    </div>
  );
};

// Fix the AppSidebar component that uses ScrollArea
const AppSidebar: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <SidebarContainer className={className} {...props}>
      <ScrollArea className="flex-1 px-2">
        {/* Sidebar content will go here */}
      </ScrollArea>
    </SidebarContainer>
  );
};

export default AppSidebar;
