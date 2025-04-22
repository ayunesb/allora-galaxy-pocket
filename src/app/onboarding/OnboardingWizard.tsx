
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useTenant } from "@/hooks/useTenant";
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
import WorkspaceSwitcher from "@/app/workspace/WorkspaceSwitcher";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getFirstInvalidStep } from "./components/StepValidation";

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
  const { tenant } = useTenant();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<OnboardingProfile>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState<boolean>(false);
  const navigate = useNavigate();

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
      // After submission, check for success, then navigate or return user to correction step
      const result = await completeOnboarding(finalProfile);
      if (result.success) {
        // Navigate ASAP after success
        navigate("/dashboard");
      } else {
        // Find which step is invalid and send user there
        const firstErrorStep = getFirstInvalidStep(finalProfile);
        if (firstErrorStep !== null) setStep(firstErrorStep);
        // Also surface any error as a toast (already done in hook)
        setFormError(result.error || "Unknown error, please try again.");
      }
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

  // If there's no live tenant selected, show workspace selector with instructions
  if (!tenant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-gray-900 p-4">
        <Card className="w-full max-w-2xl p-6 space-y-6 bg-card dark:bg-gray-800 border border-border dark:border-gray-700">
          <Alert variant="destructive">
            <AlertTitle>No workspace selected</AlertTitle>
            <AlertDescription>
              Please select a workspace before continuing with onboarding.
            </AlertDescription>
          </Alert>
          
          <div className="p-4 border rounded-md bg-muted/50">
            <h3 className="text-lg font-medium mb-3">Select a workspace to continue</h3>
            <WorkspaceSwitcher highlight={true} />
            
            {workspaceError && (
              <p className="text-sm text-destructive mt-2">
                You must select a workspace to continue with onboarding.
              </p>
            )}
            
            <div className="mt-6">
              <Button 
                className="w-full" 
                onClick={() => {
                  if (!tenant) {
                    setWorkspaceError(true);
                    toast({
                      title: "Workspace required",
                      description: "Please select a workspace from the dropdown above.",
                      variant: "destructive"
                    });
                  }
                }}
              >
                Continue to Onboarding <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

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
