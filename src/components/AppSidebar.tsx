
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from '@/hooks/useSidebar';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter 
} from "@/components/ui/sidebar";

interface SidebarContainerProps {
  children: React.ReactNode;
  className?: string;
}

const SidebarContainer = ({ children, className = '' }: SidebarContainerProps) => {
  const { collapsed } = useSidebar();
  
  return (
    <div className={`h-screen flex flex-col bg-card border-r transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} ${className}`}>
      {children}
    </div>
  );
};

const AppSidebar = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <Sidebar className={className} {...props}>
      <SidebarHeader>
        {/* Logo or branding can go here */}
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="flex-1 px-2">
          {/* Navigation content will go here */}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        {/* Footer content can go here */}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
