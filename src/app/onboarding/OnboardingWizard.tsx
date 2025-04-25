
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ui/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { OnboardingForm } from "./components/OnboardingForm";
import { WorkspaceRequirement } from "./components/WorkspaceRequirement";
import { AuthRequirement } from "./components/AuthRequirement";
import { OnboardingProfile } from "@/types/onboarding";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useStepNavigation } from "./components/StepNavigator";
import { useOnboardingSubmission } from "./hooks/useOnboardingSubmission";
import { steps } from "./steps";

export default function OnboardingWizard() {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const { user, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<OnboardingProfile>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState<boolean>(false);
  const navigate = useNavigate();
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);

  const { isSubmitting, completeOnboarding } = useOnboardingSubmission();
  const CurrentStep = steps[step];

  useEffect(() => {
    if (!tenantLoading && !tenant && !authLoading) {
      setWorkspaceError(true);
      toast({
        title: "Workspace required",
        description: "Please select or create a workspace to continue.",
        variant: "destructive"
      });
    } else if (tenant) {
      setWorkspaceError(false);
    }
  }, [tenant, tenantLoading, authLoading, toast]);

  if (tenantLoading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-gray-900 p-4">
        <LoadingOverlay show={true} label="Loading your workspace..." />
      </div>
    );
  }

  if (!user) {
    return <AuthRequirement />;
  }

  if (!tenant) {
    return (
      <WorkspaceRequirement 
        workspaceError={workspaceError}
        onContinue={() => {
          if (!tenant) {
            setWorkspaceError(true);
            toast({
              title: "Workspace required",
              description: "Please select or create a workspace above.",
              variant: "destructive"
            });
            return;
          }
          window.location.reload();
        }}
      />
    );
  }

  const handleOnboardingCompletion = async (finalProfile: OnboardingProfile) => {
    try {
      const result = await completeOnboarding(finalProfile);
      if (result.success) {
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 500);
      } else {
        setFormError(result.error || "Unknown error, please try again.");
      }
    } catch (error) {
      console.error("[handleOnboardingCompletion] Unexpected error:", error);
      setFormError("A system error occurred. Please try again or contact support.");
    }
  };

  const { handleNext } = useStepNavigation({
    step,
    totalSteps: steps.length,
    profile,
    onNext: (data) => {
      setProfile((prev) => ({ ...prev, ...data }));
      setStep((prev) => Math.min(prev + 1, steps.length - 1));
    },
    onBack: () => setStep((prev) => Math.max(prev - 1, 0)),
    setFormError,
    completeOnboarding: handleOnboardingCompletion
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-gray-900 p-4">
      <LoadingOverlay show={isSubmitting} label="Setting up your OS..." />
      <OnboardingForm
        step={step}
        totalSteps={steps.length}
        tenant={tenant}
        formError={formError}
        isSubmitting={isSubmitting}
        onWorkspaceChange={() => navigate("/workspace")}
      >
        <CurrentStep {...{
          next: handleNext,
          back: () => setStep((prev) => Math.max(prev - 1, 0)),
          profile
        }} />
      </OnboardingForm>
    </div>
  );
}
