
import React from 'react';
import { Loader2 } from 'lucide-react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8'
};

export default function LoadingSpinner({ 
  size = 'md', 
  label,
  className = '' 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader2 className={`animate-spin ${sizeMap[size]}`} />
      {label && <span className="text-muted-foreground">{label}</span>}
    </div>
  );
}
