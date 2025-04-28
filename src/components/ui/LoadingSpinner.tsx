
import React from "react";

interface LoadingSpinnerProps {
  size?: number | "sm" | "md" | "lg" | "xl";
  color?: string;
  className?: string;
  label?: string;
}

export default function LoadingSpinner({ 
  size = "md", 
  color = "currentColor", 
  className = "",
  label
}: LoadingSpinnerProps) {
  let sizeValue: number;
  
  // Convert size string to pixels
  switch (size) {
    case "sm": sizeValue = 16; break;
    case "md": sizeValue = 24; break;
    case "lg": sizeValue = 36; break;
    case "xl": sizeValue = 48; break;
    default: sizeValue = typeof size === "number" ? size : 24;
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        className="animate-spin"
        width={sizeValue}
        height={sizeValue}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill={color}
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {label && <p className="mt-2 text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}
