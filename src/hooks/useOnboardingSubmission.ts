
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingProfile } from "@/types/onboarding";
import { ToastService } from "@/services/ToastService";
import { useTenant } from "@/hooks/useTenant";
import { useSystemLogs } from "@/hooks/useSystemLogs";

export function useOnboardingSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const { logActivity } = useSystemLogs();

  const completeOnboarding = async (profile: OnboardingProfile) => {
    if (!tenant?.id) {
      console.error("Cannot complete onboarding: No tenant ID available");
      ToastService.error({
        title: "Workspace Error",
        description: "Workspace not selected. Please try again."
      });
      return {
        success: false,
        error: "Workspace not selected. Please try again."
      };
    }

    setIsSubmitting(true);
    try {
      // Log the onboarding start for monitoring
      await logActivity({
        event_type: 'ONBOARDING_STARTED',
        message: `Onboarding process started for ${profile.companyName || 'new company'}`,
        meta: {
          company: profile.companyName,
          industry: profile.industry
        }
      });
      
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
      
      // Log successful onboarding completion
      await logActivity({
        event_type: 'ONBOARDING_COMPLETED',
        message: `Onboarding completed successfully for ${profile.companyName || 'new company'}`,
        meta: {
          tenant_id: tenant.id,
          profile_data: {
            industry: profile.industry,
            teamSize: profile.teamSize,
            launchMode: profile.launch_mode
          }
        }
      });

      ToastService.success({
        title: "Setup complete!",
        description: "Welcome to Allora OS"
      });

      return { success: true };
    } catch (error: any) {
      console.error("Onboarding submission error:", error);
      
      // Log onboarding failure for monitoring
      await logActivity({
        event_type: 'ONBOARDING_FAILED',
        message: `Onboarding failed for ${profile.companyName || 'new company'}: ${error.message}`,
        meta: {
          error_details: error.message || "Unknown error",
          tenant_id: tenant.id
        }
      });
      
      ToastService.error({
        title: "Failed to save onboarding data",
        description: error.message || "An unexpected error occurred"
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
