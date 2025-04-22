
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { OnboardingProfile } from "@/types/onboarding";
import Step1Company from "./steps/Step1Company";
import Step2Industry from "./steps/Step2Industry";
import StepTeamSize from "./steps/StepTeamSize";
import StepRevenue from "./steps/StepRevenue";
import StepSellType from "./steps/StepSellType";
import StepTone from "./steps/StepTone";
import StepChallenges from "./steps/StepChallenges";
import StepChannels from "./steps/StepChannels";
import StepTools from "./steps/StepTools";
import Step3Goals from "./steps/Step3Goals";
import StepLaunchMode from "./steps/StepLaunchMode";
import { BillingPreview } from "@/components/billing/BillingPreview";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { OnboardingProgressIndicator } from "./components/OnboardingProgressIndicator";
import { OnboardingError } from "./components/OnboardingError";
import { useOnboardingSubmission } from "./hooks/useOnboardingSubmission";
import { useStepNavigation } from "./components/StepNavigator";

const steps = [
  Step1Company,
  Step2Industry,
  StepTeamSize,
  StepRevenue,
  StepSellType,
  StepTone,
  StepChallenges,
  StepChannels,
  StepTools,
  Step3Goals,
  StepLaunchMode,
];

export default function OnboardingWizard() {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<OnboardingProfile>({});
  const [formError, setFormError] = useState<string | null>(null);

  const { isSubmitting, completeOnboarding } = useOnboardingSubmission();
  
  const CurrentStep = steps[step];

  const next = (data: Partial<OnboardingProfile>) => {
    setProfile((prev) => ({ ...prev, ...data }));
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const back = () => setStep((prev) => Math.max(prev - 1, 0));
  
  const { handleNext } = useStepNavigation({
    step,
    totalSteps: steps.length,
    profile,
    onNext: next,
    onBack: back,
    setFormError,
    completeOnboarding: async (finalProfile) => {
      await completeOnboarding(finalProfile);
    }
  });

  const getStepProps = () => {
    const commonProps = {
      next: handleNext,
      profile
    };

    if (step === 0) {
      return commonProps;
    }

    return {
      ...commonProps,
      back
    };
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-gray-900 p-4">
      <LoadingOverlay show={isSubmitting} label="Setting up your OS..." />
      <Card className="w-full max-w-2xl p-6 space-y-6 bg-card dark:bg-gray-800 border border-border dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground dark:text-white">Setup your Allora OS</h1>
          <OnboardingProgressIndicator currentStep={step} totalSteps={steps.length} />
        </div>
        <BillingPreview />
        <OnboardingError error={formError} />
        <CurrentStep {...getStepProps()} />
      </Card>
    </div>
  );
}
