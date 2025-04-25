
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OnboardingProgressIndicator } from "./OnboardingProgressIndicator";
import { OnboardingError } from "./OnboardingError";
import { BillingPreview } from "@/components/billing/BillingPreview";
import LiveSystemVerification from "@/components/LiveSystemVerification";
import { ArrowRight } from "lucide-react";
import type { Tenant } from "@/types/tenant";

interface OnboardingFormProps {
  step: number;
  totalSteps: number;
  tenant: Tenant;
  formError: string | null;
  isSubmitting: boolean;
  onWorkspaceChange: () => void;
  children: React.ReactNode;
}

export function OnboardingForm({
  step,
  totalSteps,
  tenant,
  formError,
  isSubmitting,
  onWorkspaceChange,
  children,
}: OnboardingFormProps) {
  return (
    <Card className="w-full max-w-2xl p-6 space-y-6 bg-card dark:bg-gray-800 border border-border dark:border-gray-700 relative">
      <LiveSystemVerification />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground dark:text-white">
          Setup your Allora OS
        </h1>
        <OnboardingProgressIndicator currentStep={step} totalSteps={totalSteps} />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Workspace: <span className="font-medium text-foreground">{tenant.name}</span>
        </div>
        <Button variant="outline" size="sm" onClick={onWorkspaceChange}>
          Change
        </Button>
      </div>

      <BillingPreview />
      <OnboardingError error={formError} />
      {children}
    </Card>
  );
}
