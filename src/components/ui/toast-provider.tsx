
import React from 'react';
import { Toaster } from 'sonner';
import { useTheme } from '@/components/ui/theme-provider';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <>
      {children}
      <Toaster 
        theme={theme as 'light' | 'dark' | 'system'} 
        position="top-right" 
        richColors 
        closeButton 
      />
    </>
  );
}
