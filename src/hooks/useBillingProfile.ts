
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
        // First check if we're authenticated
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          console.log("No authenticated user found");
          return null;
        }

        const { data, error } = await supabase
          .from('billing_profiles')
          .select('*')
          .maybeSingle(); // Changed from single() to maybeSingle() to prevent errors

        if (error) {
          console.error('Error fetching billing profile:', error);
          // Only show toast for non-404 errors (404s are expected if no profile exists)
          if (error.code !== 'PGRST116') {
            toast.error('Failed to load billing data');
          }
          
          // Return a default profile to prevent blank screens
          return {
            id: 'default',
            user_id: session.session.user.id,
            plan: 'standard',
            credits: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }

        console.log('Billing profile data retrieved:', data);
        return data;
      } catch (err) {
        console.error('Unexpected error in useBillingProfile:', err);
        // Return a default profile to prevent blank screens
        return {
          id: 'default',
          user_id: 'unknown',
          plan: 'standard',
          credits: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    },
    retry: 1, // Only retry once to avoid excessive requests
    // Add stale time to reduce refetches
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Add fallback for when query is disabled
    placeholderData: {
      id: 'default',
      user_id: 'unknown',
      plan: 'standard',
      credits: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  });
}
