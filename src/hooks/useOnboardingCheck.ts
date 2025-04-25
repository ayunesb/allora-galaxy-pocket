
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tenant } from "@/types/tenant";

export function useOnboardingCheck(
  user: User | null, 
  tenant: Tenant | null,
  enabled = true
) {
  return useQuery({
    queryKey: ['onboarding-status', user?.id, tenant?.id],
    queryFn: async () => {
      if (!user || !tenant) return false;
      
      const { data, error } = await supabase
        .from('onboarding_status')
        .select('completed')
        .eq('tenant_id', tenant.id)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No record found, onboarding not complete
          return false;
        }
        throw error;
      }
      
      return data?.completed || false;
    },
    enabled: !!user && !!tenant && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
