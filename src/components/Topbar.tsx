
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { useSidebar } from '@/hooks/useSidebar';

interface TopbarProps {
  title?: string;
}

const Topbar: React.FC<TopbarProps> = ({ title = 'Dashboard' }) => {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 border-b bg-background">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <h1 className="ml-4 text-xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center space-x-2">
        <DarkModeToggle />
      </div>
    </div>
  );
};

export default Topbar;
