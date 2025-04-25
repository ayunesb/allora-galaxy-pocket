
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  label?: string;
  className?: string;
}

const LoadingSpinner = ({ size = 24, label, className = '' }: LoadingSpinnerProps) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`h-${size} w-${size} animate-spin text-primary`} />
      {label && (
        <p className="mt-2 text-sm text-muted-foreground">{label}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
