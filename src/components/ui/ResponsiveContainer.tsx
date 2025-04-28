
import React from 'react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: Breakpoint | 'full' | 'none';
  padding?: string;
  centered?: boolean;
  fluid?: boolean;
}

const breakpointMap = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
  none: ''
};

export function ResponsiveContainer({
  children,
  className,
  maxWidth = 'xl',
  padding = 'px-4 sm:px-6 md:px-8',
  centered = true,
  fluid = false
}: ResponsiveContainerProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  const containerClasses = cn(
    padding,
    fluid ? 'w-full' : breakpointMap[maxWidth],
    centered && 'mx-auto',
    className
  );

  return (
    <div className={containerClasses} data-mobile={isMobile || undefined}>
      {children}
    </div>
  );
}

export default ResponsiveContainer;
