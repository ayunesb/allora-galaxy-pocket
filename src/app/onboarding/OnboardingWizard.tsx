import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { supabase } from "@/integrations/supabase/client";
import type { OnboardingProfile } from "@/types/onboarding";
import Step1Company from "./steps/Step1Company";
import Step2Industry from "./steps/Step2Industry";
import StepTone from "./steps/StepTone";
import StepTeamSize from "./steps/StepTeamSize";
import StepSellType from "./steps/StepSellType";
import StepRevenue from "./steps/StepRevenue";
import StepChallenges from "./steps/StepChallenges";
import StepChannels from "./steps/StepChannels";
import StepTools from "./steps/StepTools";
import Step3Goals from "./steps/Step3Goals";
import StepLaunchMode from "./steps/StepLaunchMode";
import { BillingPreview } from "@/components/billing/BillingPreview";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<OnboardingProfile>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const CurrentStep = steps[step];

  const next = async (data: Partial<OnboardingProfile>) => {
    setFormError(null);
    setProfile((prev) => ({ ...prev, ...data }));

    switch (step) {
      case 0:
        if (!data.companyName?.trim()) {
          setFormError("Please provide your company name to continue.");
          return;
        }
        break;
      case 1:
        if (!data.industry) {
          setFormError("Please select your industry.");
          return;
        }
        break;
      case 2:
        if (!data.teamSize) {
          setFormError("Please select your team size.");
          return;
        }
        break;
      case 3:
        if (!data.revenue) {
          setFormError("Please select your revenue range.");
          return;
        }
        break;
      case 4:
        if (!data.sellType) {
          setFormError("Please select what you sell.");
          return;
        }
        break;
      case 5:
        if (!data.tone) {
          setFormError("Please select your brand's tone.");
          return;
        }
        break;
      case 6:
        if (!Array.isArray(data.challenges) || !data.challenges.length) {
          setFormError("Please add at least one business challenge.");
          return;
        }
        break;
      case 7:
        if (!Array.isArray(data.channels) || !data.channels.length) {
          setFormError("Please select at least one channel.");
          return;
        }
        break;
      case 8:
        if (!Array.isArray(data.tools)) {
          setFormError("Please select your tools (if any).");
        }
        break;
      case 9:
        if (!Array.isArray(data.goals) || !data.goals.length) {
          setFormError("Please add at least one business goal.");
          return;
        }
        break;
      case 10:
        if (!data.launch_mode) {
          setFormError("Please select a launch mode.");
          return;
        }
        break;
      default:
        break;
    }

    if (step === steps.length - 1) {
      await completeOnboarding({ ...profile, ...data });
      return;
    }

    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const back = () => setStep((prev) => Math.max(prev - 1, 0));

  const completeOnboarding = async (finalProfile: OnboardingProfile) => {
    if (!user || !tenant?.id) {
      toast({
        title: "Oops! Can't save your profile",
        description: "We couldn't detect your login or workspace. Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const { error: companyError } = await supabase
        .from('company_profiles')
        .upsert({
          tenant_id: tenant.id,
          name: finalProfile.companyName || 'My Company',
          industry: finalProfile.industry || 'Other',
          team_size: finalProfile.teamSize || 'small',
          revenue_tier: finalProfile.revenue || 'pre-revenue',
          launch_mode: finalProfile.launch_mode || 'guided',
          product_stage: finalProfile.productStage,
          target_market: finalProfile.targetMarket
        });

      if (companyError) throw companyError;

      const { error: personaError } = await supabase
        .from('persona_profiles')
        .upsert({
          tenant_id: tenant.id,
          user_id: user.id,
          goal: finalProfile.goals?.[0] || 'growth',
          pain_points: finalProfile.challenges || [],
          tone: finalProfile.tone || 'professional',
          channels: finalProfile.channels || [],
          tools: finalProfile.tools || [],
          sell_type: finalProfile.sellType || 'b2b'
        });

      if (personaError) throw personaError;

      const { error: strategyError } = await supabase.functions.invoke('generate-strategy', {
        body: {
          user_id: user?.id,
          tenant_id: tenant?.id
        }
      });

      if (strategyError) throw strategyError;

      toast({
        title: "Setup Complete!",
        description: "Your Allora OS is now ready. We've generated your first strategies!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error saving onboarding data:", error);
      toast({
        title: "We're sorry, something went wrong.",
        description: "Could not finish onboarding. Please check your internet and try again. If the problem continues, contact support.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepProps = () => {
    const commonProps = {
      next,
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <LoadingOverlay show={isSubmitting} label="Setting up your OS..." />
      <Card className="w-full max-w-2xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Setup your Allora OS</h1>
          <span className="text-sm text-muted-foreground">
            Step {step + 1} of {steps.length}
          </span>
        </div>
        <BillingPreview />
        {formError && (
          <div className="px-3 py-2 mt-2 mb-2 bg-destructive/10 text-destructive rounded text-sm" role="alert">
            {formError}
          </div>
        )}
        <CurrentStep {...getStepProps()} />
      </Card>
    </div>
  );
}
