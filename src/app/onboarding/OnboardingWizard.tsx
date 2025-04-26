
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ui/theme-provider";
import { OnboardingForm } from "./components/OnboardingForm";
import { WorkspaceRequirement } from "./components/WorkspaceRequirement";
import { AuthRequirement } from "./components/AuthRequirement";
import { OnboardingProfile } from "@/types/onboarding";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useStepNavigation } from "./components/StepNavigator";
import { steps } from "./steps";
import { toast } from "sonner";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { useOnboardingSubmission } from "@/hooks/useOnboardingSubmission";

export default function OnboardingWizard() {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const { user, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<OnboardingProfile>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState<boolean>(false);
  const navigate = useNavigate();
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const { logActivity } = useSystemLogs();

  const { isSubmitting, completeOnboarding } = useOnboardingSubmission();
  const CurrentStep = steps[step];

  useEffect(() => {
    if (!tenantLoading && !tenant && !authLoading) {
      setWorkspaceError(true);
      toast("Workspace required", {
        description: "Please select or create a workspace to continue."
      });
    } else if (tenant) {
      setWorkspaceError(false);
    }
  }, [tenant, tenantLoading, authLoading]);

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
            toast("Workspace required", {
              description: "Please select or create a workspace above."
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
      setCreatingWorkspace(true);
      
      const result = await completeOnboarding(finalProfile);
      
      if (result.success) {
        // Log the successful onboarding completion
        try {
          await logActivity({
            event_type: "ONBOARDING_COMPLETED",
            message: `Onboarding completed for ${finalProfile.companyName}`,
            meta: {
              industry: finalProfile.industry,
              teamSize: finalProfile.teamSize,
              launchMode: finalProfile.launch_mode
            },
            severity: 'info'
          });
        } catch (logError) {
          console.error("Failed to log onboarding completion:", logError);
        }
        
        // Show success toast with guidance to next step
        toast("Onboarding complete!", {
          description: "Let's create your first growth strategy"
        });
        
        setTimeout(() => {
          navigate("/strategy", { 
            replace: true,
            state: { 
              fromOnboarding: true,
              profile: finalProfile
            }
          });
        }, 800);
      } else {
        setFormError(result.error || "Unknown error, please try again.");
        toast("Onboarding failed", {
          description: result.error || "Please try again"
        });
      }
    } catch (error) {
      console.error("[handleOnboardingCompletion] Unexpected error:", error);
      setFormError("A system error occurred. Please try again or contact support.");
      toast("System error", {
        description: "Please try again or contact support"
      });
    } finally {
      setCreatingWorkspace(false);
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
      <LoadingOverlay show={isSubmitting || creatingWorkspace} label={creatingWorkspace ? "Setting up your workspace..." : "Processing onboarding..."} />
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
