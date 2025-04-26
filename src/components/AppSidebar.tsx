
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from '@/hooks/useSidebar';
import { MainNavigation } from './sidebar/SidebarNavigation';
import { AccountLinks, AdminLinks } from './sidebar/SidebarLinks';
import SidebarSection from './sidebar/SidebarSection';

const AppSidebar = () => {
  const { collapsed } = useSidebar();
  
  return (
    <aside className={`fixed left-0 top-0 bottom-0 bg-background border-r border-gray-200 pt-16 hidden md:block overflow-y-auto transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <ScrollArea className="h-full">
        <div className="px-3 py-2">
          <MainNavigation />
          
          <SidebarSection title="Account">
            <AccountLinks />
          </SidebarSection>
          
          <SidebarSection title="Admin">
            <AdminLinks />
          </SidebarSection>
        </div>
      </ScrollArea>
    </aside>
  );
};

export default AppSidebar;
