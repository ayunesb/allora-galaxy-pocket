
import React from 'react';
import { Outlet } from 'react-router-dom';
import GlobalErrorBoundary from './ui/GlobalErrorBoundary';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface AppErrorHandlerProps {
  children?: React.ReactNode;
}

export function AppErrorHandler({ children }: AppErrorHandlerProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  return (
    <GlobalErrorBoundary>
      {children || <Outlet />}
    </GlobalErrorBoundary>
  );
}

export default AppErrorHandler;
