
import React from 'react';
import { useTheme } from "@/components/ui/theme-provider";
import { Button } from '@/components/ui/button';

const ThemeTest: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Theme Testing Component</h2>
      <p>Current theme: {theme}</p>
      <div className="flex gap-2">
        <Button onClick={() => setTheme('light')}>Light</Button>
        <Button onClick={() => setTheme('dark')}>Dark</Button>
        <Button onClick={() => setTheme('system')}>System</Button>
      </div>
    </div>
  );
};

export default ThemeTest;
