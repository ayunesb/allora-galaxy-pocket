
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
      // Complete onboarding and save data to Supabase
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
      // Save the complete profile to Supabase
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/save-onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          profile: finalProfile,
          userId: user.id,
          tenantId: tenant.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save onboarding data');
      }

      toast({
        title: "Setup Complete!",
        description: "Your Allora OS is now ready to use.",
      });

      // Redirect to dashboard instead of startup
      navigate("/dashboard");
    } catch (error) {
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
