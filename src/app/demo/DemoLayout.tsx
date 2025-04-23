
import React from 'react';
import { useDemoAnalytics } from '@/hooks/useDemoAnalytics';

interface DemoLayoutProps {
  children: React.ReactNode;
}

export const DemoLayout = ({ children }: DemoLayoutProps) => {
  useDemoAnalytics();

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
};
