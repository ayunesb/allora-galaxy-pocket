
import React, { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTheme } from '@/components/ui/theme-provider';

export function ResponsiveToastProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [position, setPosition] = useState<'top-right' | 'bottom-center'>('top-right');
  
  // Explicit type assertion to match Sonner's theme types
  const toasterTheme = theme as 'light' | 'dark' | 'system';
  
  // Change toast position based on screen size
  useEffect(() => {
    setPosition(isMobile ? 'bottom-center' : 'top-right');
  }, [isMobile]);

  return (
    <>
      {children}
      <Toaster 
        theme={toasterTheme} 
        position={position} 
        richColors 
        closeButton 
        expand={false}
        visibleToasts={isMobile ? 2 : 3}
        toastOptions={{ 
          duration: isMobile ? 3000 : 4000,
          className: isMobile ? 'w-[calc(100vw-32px)] shadow-md' : 'shadow-md',
          // Ensuring all content is rendered as strings to prevent React child errors
          render: (data) => {
            if (typeof data === 'object' && data !== null) {
              return JSON.stringify(data);
            }
            return data;
          }
        }}
      />
    </>
  );
}

export default ResponsiveToastProvider;
