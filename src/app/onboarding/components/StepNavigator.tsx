
import React from "react";
import { OnboardingProfile } from "@/types/onboarding";
import { validateStep } from "./StepValidation";

interface StepNavigatorProps {
  step: number;
  totalSteps: number;
  profile: OnboardingProfile;
  onNext: (data: Partial<OnboardingProfile>) => void;
  onBack: () => void;
  setFormError: (error: string | null) => void;
  completeOnboarding: (profile: OnboardingProfile) => Promise<void>;
}

export const useStepNavigation = ({
  step,
  totalSteps,
  profile,
  onNext,
  onBack,
  setFormError,
  completeOnboarding
}: StepNavigatorProps) => {
  
  const handleNext = async (data: Partial<OnboardingProfile>) => {
    setFormError(null);
    const updatedProfile = { ...profile, ...data };
    
    const error = validateStep(step, data);
    if (error) {
      setFormError(error);
      return;
    }
    
    // For the final step, proceed directly to onboarding completion
    if (step === totalSteps - 1) {
      console.log("Final step reached, completing onboarding...");
      await completeOnboarding(updatedProfile);
      return;
    }
    
    // For non-final steps, move to the next step
    onNext(data);
  };
  
  const handleBack = () => {
    onBack();
  };
  
  return {
    handleNext,
    handleBack
  };
};
