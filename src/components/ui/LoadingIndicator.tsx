
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type LoadingVariant = 'default' | 'subtle' | 'primary' | 'card' | 'fullscreen';

interface LoadingIndicatorProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  text?: string;
  fullWidth?: boolean;
  fullHeight?: boolean;
  className?: string;
}

export function LoadingIndicator({
  size = 'md',
  variant = 'default',
  text,
  fullWidth = false,
  fullHeight = false,
  className
}: LoadingIndicatorProps) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const containerClasses = {
    default: 'flex items-center justify-center p-4',
    subtle: 'flex items-center justify-center',
    primary: 'flex items-center justify-center text-primary',
    card: 'flex flex-col items-center justify-center p-6 border rounded-lg bg-card',
    fullscreen: 'fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50'
  };

  const iconClasses = cn(
    'animate-spin',
    sizeClasses[size],
    variant === 'primary' ? 'text-primary' : 'text-muted-foreground'
  );

  return (
    <div
      className={cn(
        containerClasses[variant],
        fullWidth && 'w-full',
        fullHeight && 'h-full',
        className
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={iconClasses} />
        {text && (
          <p className={cn(
            'text-sm',
            variant === 'primary' ? 'text-primary' : 'text-muted-foreground'
          )}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

export default LoadingIndicator;
