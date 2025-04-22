
import React from "react";

interface OnboardingProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const OnboardingProgressIndicator: React.FC<OnboardingProgressIndicatorProps> = ({ 
  currentStep, 
  totalSteps 
}) => {
  return (
    <span className="text-sm text-muted-foreground">
      Step {currentStep + 1} of {totalSteps}
    </span>
  );
};
