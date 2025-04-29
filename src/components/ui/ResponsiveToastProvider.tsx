
import React, { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTheme } from '@/components/ui/theme-provider';

export function ResponsiveToastProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [position, setPosition] = useState<'top-right' | 'top-center' | 'bottom-center'>('top-right');
  
  // Explicit type assertion to match Sonner's theme types
  const toasterTheme = (theme || 'light') as 'light' | 'dark' | 'system';
  
  // Change toast position based on screen size
  useEffect(() => {
    setPosition(isMobile ? 'bottom-center' : 'top-right');
  }, [isMobile]);

  // Make sure to wrap children in a fragment to avoid React rendering issues
  return (
    <>
      {children}
      <Toaster 
        theme={toasterTheme} 
        position={position} 
        richColors={true}
        closeButton={true}
        expand={false}
        visibleToasts={isMobile ? 2 : 3}
        toastOptions={{ 
          duration: isMobile ? 3000 : 4000,
          className: isMobile ? 'w-[calc(100vw-32px)] shadow-md max-w-sm text-sm' : 'shadow-md',
        }}
      />
    </>
  );
}

export default ResponsiveToastProvider;
