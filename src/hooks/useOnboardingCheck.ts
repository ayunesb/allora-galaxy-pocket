
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
    queryKey: ["onboarding-check", user?.id, tenant?.id],
    queryFn: async () => {
      if (!user || !tenant) return false;
      
      const { data, error } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("tenant_id", tenant.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error checking onboarding status:", error);
        throw error;
      }
      
      return !!data;
    },
    enabled: !!user && !!tenant && enabled,
    staleTime: 60000, // 1 minute
    cacheTime: 300000, // 5 minutes
  });
}
