
import React, { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTheme } from '@/components/ui/theme-provider';

export function ResponsiveToastProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [position, setPosition] = useState<'top-right' | 'bottom-center'>('top-right');
  
  // Change toast position based on screen size
  useEffect(() => {
    setPosition(isMobile ? 'bottom-center' : 'top-right');
  }, [isMobile]);

  return (
    <>
      {children}
      <Toaster 
        theme={theme as 'light' | 'dark' | 'system'} 
        position={position} 
        richColors 
        closeButton 
        visibleToasts={isMobile ? 2 : 3}
        toastOptions={{ 
          duration: isMobile ? 3000 : 4000,
          className: isMobile ? 'w-[calc(100vw-32px)]' : undefined
        }}
      />
    </>
  );
}

export default ResponsiveToastProvider;
