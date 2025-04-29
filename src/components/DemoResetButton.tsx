
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useDemoRestrictions } from '@/hooks/useDemoRestrictions';

interface DemoResetButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function DemoResetButton({ variant = 'outline', size = 'default' }: DemoResetButtonProps) {
  const { isDemoMode, resetDemo, isResetting, lastResetTime } = useDemoRestrictions();

  if (!isDemoMode) return null;

  // Format the last reset time if available
  const lastResetText = lastResetTime 
    ? `Last reset: ${lastResetTime.toLocaleTimeString()}`
    : '';

  return (
    <div className="space-y-1">
      <Button 
        variant={variant} 
        size={size} 
        onClick={resetDemo}
        disabled={isResetting}
        className="gap-2"
      >
        <RefreshCcw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
        {isResetting ? 'Resetting Demo...' : 'Reset Demo'}
      </Button>
      {lastResetTime && (
        <p className="text-xs text-muted-foreground">{lastResetText}</p>
      )}
    </div>
  );
}
