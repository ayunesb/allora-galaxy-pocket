
import React from "react";

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

const SidebarSection = ({ title, children }: SidebarSectionProps) => (
  <div className="pt-4 mt-4 border-t border-gray-200">
    <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      {title}
    </h3>
    {children}
  </div>
);

export default SidebarSection;
