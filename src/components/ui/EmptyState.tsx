
import React from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    buttonProps?: ButtonProps;
  };
  className?: string;
}

export function EmptyState({ 
  title, 
  description, 
  icon, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-8 rounded-lg border border-dashed",
      className
    )}>
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      
      <h3 className="text-lg font-medium">{title}</h3>
      
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
      
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-4"
          {...action.buttonProps}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
