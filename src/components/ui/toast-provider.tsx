
import React from 'react';
import { Toaster } from 'sonner';
import { useTheme } from '@/components/ui/theme-provider';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  
  // Using type assertion to ensure theme value matches allowed Sonner theme types
  const toasterTheme = theme as 'light' | 'dark' | 'system';

  return (
    <>
      {children}
      <Toaster 
        theme={toasterTheme}
        position="top-right" 
        richColors 
        closeButton
        expand={false}
        visibleToasts={3}
        toastOptions={{
          duration: 4000,
          className: "shadow-md",
        }}
      />
    </>
  );
}
