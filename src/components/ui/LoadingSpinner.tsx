
import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpinnerSize } from "@/types/agent";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-10 w-10"
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "md", 
  className, 
  label 
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
      {label && <span className="mt-2 text-sm text-muted-foreground">{label}</span>}
    </div>
  );
};

export default LoadingSpinner;
