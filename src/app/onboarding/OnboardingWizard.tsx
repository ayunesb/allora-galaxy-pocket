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

  const CurrentStep = steps[step];

  const next = async (data: Partial<OnboardingProfile>) => {
    setProfile((prev) => ({ ...prev, ...data }));
    
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
        title: "Error",
        description: "Unable to save your profile. Please try again.",
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
        description: "Your Allora OS is now ready to use. Initial strategies have been generated.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error saving onboarding data:", error);
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
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
      <Card className="w-full max-w-2xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Setup your Allora OS</h1>
          <span className="text-sm text-muted-foreground">
            Step {step + 1} of {steps.length}
          </span>
        </div>
        <BillingPreview />
        <CurrentStep {...getStepProps()} />
      </Card>
    </div>
  );
}
