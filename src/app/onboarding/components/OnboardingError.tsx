
import React from "react";

interface OnboardingErrorProps {
  error: string | null;
}

export const OnboardingError: React.FC<OnboardingErrorProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="px-3 py-2 mt-2 mb-2 bg-destructive/10 text-destructive rounded text-sm" role="alert">
      {error}
    </div>
  );
};
