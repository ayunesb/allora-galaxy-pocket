
import React from "react";
import { MainNavigation } from "./sidebar/SidebarNavigation";
import { AccountLinks, AdminLinks } from "./sidebar/SidebarLinks";
import SidebarSection from "./sidebar/SidebarSection";

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-gray-200 pt-16 hidden md:block overflow-y-auto">
      <div className="px-3 py-2">
        <MainNavigation />
        
        <SidebarSection title="Account">
          <AccountLinks />
        </SidebarSection>
        
        <SidebarSection title="Admin">
          <AdminLinks />
        </SidebarSection>
      </div>
    </aside>
  );
};

export default Sidebar;
