
import React, { ReactNode } from 'react';
import { useSidebar } from '@/hooks/useSidebar';

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
}

const SidebarSection = ({ title, children }: SidebarSectionProps) => {
  const { collapsed } = useSidebar();

  if (collapsed) {
    return <div className="mt-4">{children}</div>;
  }

  return (
    <div className="mt-4">
      <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      <div className="mt-1">
        {children}
      </div>
    </div>
  );
};

export default SidebarSection;
