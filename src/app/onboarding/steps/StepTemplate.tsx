
import React from "react";
import { Button } from "@/components/ui/button";

interface StepTemplateProps {
  title: string;
  description?: string;
  showBack?: boolean;
  showNext?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
  backLabel?: string;
  onNext?: () => void;
  onBack?: () => void;
  children: React.ReactNode;
}

const StepTemplate: React.FC<StepTemplateProps> = ({
  title,
  description,
  showBack = true,
  showNext = true,
  nextDisabled = false,
  nextLabel = "Next",
  backLabel = "Back",
  onNext,
  onBack,
  children,
}) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-lg font-medium">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    {children}
    <div className="flex justify-between">
      {showBack ? (
        <Button variant="outline" onClick={onBack}>{backLabel}</Button>
      ) : <span />}
      {showNext && (
        <Button onClick={onNext} disabled={nextDisabled}>{nextLabel}</Button>
      )}
    </div>
  </div>
);

export default StepTemplate;
