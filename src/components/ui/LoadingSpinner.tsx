
import React from "react";
import { Loader } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export default function LoadingSpinner({ size = 32, className, label }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className ?? ""}`}>
      <Loader className="animate-spin text-primary" size={size} aria-label="Loading" />
      {label && <span className="mt-2 text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}
