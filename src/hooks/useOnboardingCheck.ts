
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tenant } from "@/types/tenant";
import { useSystemLogs } from "./useSystemLogs";

/**
 * Hook to check if a user has completed onboarding
 * Implements the three-phase approach:
 * Phase 1: Fix errors - Basic onboarding check
 * Phase 2: Add error handling and edge cases 
 * Phase 3: Test with different user roles
 */
export function useOnboardingCheck(
  user: User | null,
  tenant: Tenant | null,
  enabled = true
) {
  const { logActivity } = useSystemLogs();

  return useQuery({
    queryKey: ["onboarding-check", user?.id, tenant?.id],
    queryFn: async () => {
      // Phase 1: Basic functionality implementation
      if (!user?.id || !tenant?.id) {
        return false;
      }

      try {
        // Check company profile existence as indication of onboarding completion
        const { data: companyProfile, error } = await supabase
          .from("company_profiles")
          .select("*")
          .eq("tenant_id", tenant.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        const isOnboardingComplete = !!companyProfile;

        // Phase 2: Log the check for audit and error tracking
        await logActivity({
          event_type: "ONBOARDING_CHECK",
          message: `Onboarding check for user ${user.id}: ${isOnboardingComplete ? "complete" : "incomplete"}`,
          meta: {
            tenant_id: tenant.id,
            user_id: user.id,
            onboarding_status: isOnboardingComplete ? "complete" : "incomplete"
          }
        });

        // Phase 3: Handle role-based differences
        // For demo users (is_demo tenant), we'll consider onboarding complete
        if (tenant.isDemo) {
          return true;
        }

        return isOnboardingComplete;
      } catch (error) {
        console.error("Error in onboarding check:", error);
        
        // Log the error but don't break the flow
        await logActivity({
          event_type: "ONBOARDING_CHECK_ERROR",
          message: `Error checking onboarding status: ${error instanceof Error ? error.message : String(error)}`,
          meta: {
            tenant_id: tenant?.id,
            user_id: user?.id,
            error: error instanceof Error ? error.message : String(error)
          }
        });
        
        // Default to false if error occurs
        return false;
      }
    },
    enabled: enabled && !!user?.id && !!tenant?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
