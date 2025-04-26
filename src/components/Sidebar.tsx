
import React from "react";
import { MainNavigation } from "./sidebar/SidebarNavigation";
import { AccountLinks, AdminLinks } from "./sidebar/SidebarLinks";
import SidebarSection from "./sidebar/SidebarSection";
import { useSidebar } from "@/hooks/useSidebar";

const Sidebar = () => {
  const { collapsed } = useSidebar();
  
  return (
    <aside className={`fixed left-0 top-0 bottom-0 bg-background border-r border-gray-200 pt-16 hidden md:block overflow-y-auto transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="px-3 py-2">
        <MainNavigation />
        
        {!collapsed && (
          <>
            <SidebarSection title="Account">
              <AccountLinks />
            </SidebarSection>
            
            <SidebarSection title="Admin">
              <AdminLinks />
            </SidebarSection>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
