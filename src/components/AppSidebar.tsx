
import React from 'react';
import { 
  ScrollArea 
} from "@/components/ui/scroll-area";

// Fix className props
interface SidebarContainerProps {
  children: React.ReactNode;
}

const SidebarContainer: React.FC<SidebarContainerProps & React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`h-screen flex flex-col bg-card border-r ${className}`} {...props}>
    {children}
  </div>
);

// Fix the AppSidebar component that uses ScrollArea
const AppSidebar: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
  return (
    <SidebarContainer className={className} {...props}>
      <ScrollArea className="flex-1 px-2">
        {children}
      </ScrollArea>
    </SidebarContainer>
  );
};

export default AppSidebar;
