
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingProfile } from "@/types/onboarding";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";

/**
 * Returns: { isSubmitting, completeOnboarding }
 * `completeOnboarding(profile)` returns { success: boolean, error?: string }
 */
export const useOnboardingSubmission = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeOnboarding = async (finalProfile: OnboardingProfile): Promise<{ success: boolean; error?: string }> => {
    if (!user || !tenant?.id) {
      const errMsg = "We couldn't detect your login or workspace. Please refresh and try again.";
      toast({
        title: "Oops! Can't save your profile",
        description: errMsg,
        variant: "destructive"
      });
      return { success: false, error: errMsg };
    }
    setIsSubmitting(true);

    try {
      // Save company profile
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

      // Save persona profile
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

      // Generate strategy in background
      try {
        await supabase.functions.invoke('generate-strategy', {
          body: {
            user_id: user?.id,
            tenant_id: tenant?.id
          }
        });
      } catch (strategyError) {
        console.error("Strategy generation error:", strategyError);
        // Continue with navigation even if strategy generation fails
      }

      toast({
        title: "Setup Complete!",
        description: "Your Allora OS is now ready. We've generated your first strategies!",
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error saving onboarding data:", error);
      toast({
        title: "We're sorry, something went wrong.",
        description: "Could not finish onboarding. Please check your internet and try again. If the problem continues, contact support.",
        variant: "destructive"
      });
      return { success: false, error: error?.message || "Unknown error" };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    completeOnboarding
  };
};
