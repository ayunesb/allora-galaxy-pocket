
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingProfile } from "@/types/onboarding";
import { toast } from "@/components/ui/sonner";
import { useTenant } from "@/hooks/useTenant";

export function useOnboardingSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { tenant } = useTenant();

  const completeOnboarding = async (profile: OnboardingProfile) => {
    if (!tenant?.id) {
      console.error("Cannot complete onboarding: No tenant ID available");
      toast("Error", {
        description: "Workspace not selected. Please try again.",
        variant: "destructive"
      });
      return {
        success: false,
        error: "Workspace not selected. Please try again."
      };
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("company_profiles")
        .upsert({
          tenant_id: tenant.id,
          name: profile.companyName,
          industry: profile.industry,
          team_size: profile.teamSize,
          revenue_tier: profile.revenue,
          launch_mode: profile.launch_mode
        });

      if (error) throw error;

      toast("Setup complete!", {
        description: "Welcome to Allora OS"
      });

      return { success: true };
    } catch (error: any) {
      console.error("Onboarding submission error:", error);
      toast("Error", {
        description: error.message || "Failed to save onboarding data",
        variant: "destructive"
      });
      return {
        success: false,
        error: error.message || "Failed to save onboarding data"
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    completeOnboarding
  };
}
