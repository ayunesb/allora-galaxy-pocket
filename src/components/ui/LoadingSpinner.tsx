
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 24, 
  className = '', 
  label
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <Loader2 className="animate-spin mr-2" size={size} />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
};

export default LoadingSpinner;
