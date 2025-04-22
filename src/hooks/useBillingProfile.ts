
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BillingProfile } from "@/types/billing";
import { toast } from "sonner";

export function useBillingProfile() {
  return useQuery({
    queryKey: ['billing-profile'],
    queryFn: async (): Promise<BillingProfile | null> => {
      console.log("Fetching billing profile");
      try {
        const { data, error } = await supabase
          .from('billing_profiles')
          .select('*')
          .single();

        if (error) {
          console.error('Error fetching billing profile:', error);
          // Only show toast for non-404 errors (404s are expected if no profile exists)
          if (error.code !== 'PGRST116') {
            toast.error('Failed to load billing data');
          }
          return null;
        }

        console.log('Billing profile data retrieved:', data);
        return data;
      } catch (err) {
        console.error('Unexpected error in useBillingProfile:', err);
        return null;
      }
    },
    retry: 1, // Only retry once to avoid excessive requests
  });
}
