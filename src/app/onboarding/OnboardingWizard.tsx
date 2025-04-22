
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import type { OnboardingProfile } from "@/types/onboarding";
import Step1Company from "./steps/Step1Company";
import Step2Industry from "./steps/Step2Industry";
import Step3Goals from "./steps/Step3Goals";
import StepLaunchMode from "./steps/StepLaunchMode";

const steps = [
  Step1Company,
  Step2Industry,
  StepLaunchMode,
  Step3Goals,
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<OnboardingProfile>({});

  const CurrentStep = steps[step];

  const next = (data: Partial<OnboardingProfile>) => {
    setProfile((prev) => ({ ...prev, ...data }));
    
    if (step === steps.length - 1) {
      // Complete onboarding - redirect to startup dashboard instead of dashboard
      navigate("/startup");
      return;
    }
    
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const back = () => setStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Setup your Allora OS</h1>
          <span className="text-sm text-muted-foreground">
            Step {step + 1} of {steps.length}
          </span>
        </div>
        <CurrentStep 
          next={next} 
          back={step > 0 ? back : undefined} 
          profile={profile} 
        />
      </Card>
    </div>
  );
}
