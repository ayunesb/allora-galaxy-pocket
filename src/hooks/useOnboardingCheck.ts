
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Tenant } from '@/types/tenant';

/**
 * Hook to check if a user has completed onboarding
 */
export const useOnboardingCheck = (
  user: User | null,
  tenant: Tenant | null,
  enabled = true
) => {
  return useQuery({
    queryKey: ['onboarding-status', user?.id, tenant?.id],
    queryFn: async () => {
      if (!user || !tenant) return false;
      
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('tenant_id', tenant.id)
        .single();
      
      if (error || !data) {
        return false;
      }
      
      // Check if essential fields are filled
      return Boolean(data.name && data.industry && data.team_size);
    },
    // Cache for 5 minutes unless invalidated
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: Boolean(enabled && user && tenant),
  });
};
