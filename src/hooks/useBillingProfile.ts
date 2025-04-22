
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BillingProfile } from "@/types/billing";

export function useBillingProfile() {
  return useQuery({
    queryKey: ['billing-profile'],
    queryFn: async (): Promise<BillingProfile | null> => {
      const { data, error } = await supabase
        .from('billing_profiles')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching billing profile:', error);
        return null;
      }

      return data;
    }
  });
}
