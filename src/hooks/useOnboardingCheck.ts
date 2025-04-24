
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tenant } from "@/types/tenant";

export function useOnboardingCheck(
  user: User | null, 
  tenant: Tenant | null, 
  shouldCheck: boolean
) {
  return useQuery({
    queryKey: ['onboarding-status', tenant?.id, user?.id],
    queryFn: async () => {
      if (!user || !tenant?.id) return false;
      
      try {
        // Check for company profile
        const { data: companyProfile, error: companyError } = await supabase
          .from('company_profiles')
          .select('id')
          .eq('tenant_id', tenant.id)
          .maybeSingle();

        if (companyError) {
          console.error("Error checking company profile:", companyError);
          return false;
        }

        // Check for persona profile
        const { data: personaProfile, error: personaError } = await supabase
          .from('persona_profiles')
          .select('id')
          .eq('tenant_id', tenant.id)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (personaError) {
          console.error("Error checking persona profile:", personaError);
          return false;
        }

        return !!companyProfile && !!personaProfile;
      } catch (err) {
        console.error("Error checking onboarding status:", err);
        return false;
      }
    },
    enabled: shouldCheck,
    retry: 2,
    staleTime: 30000 // Cache for 30 seconds
  });
}
