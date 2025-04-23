
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BillingProfile } from "@/types/billing";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export function useBillingProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['billing-profile', user?.id],
    queryFn: async (): Promise<BillingProfile | null> => {
      console.log("Fetching billing profile for user:", user?.id);
      try {
        // First check if we're authenticated
        if (!user?.id) {
          console.log("No authenticated user found");
          return null;
        }

        const { data, error } = await supabase
          .from('billing_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching billing profile:', error);
          
          // Try to create a billing profile if one doesn't exist
          if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
            await createDefaultProfile();
            // Re-fetch after creation
            const { data: newData, error: newError } = await supabase
              .from('billing_profiles')
              .select('*')
              .eq('user_id', user.id)
              .maybeSingle();
              
            if (newError) {
              throw newError;
            }
            
            return newData;
          } 
          
          throw error;
        }

        // If no profile exists yet, create a default one
        if (!data) {
          console.log("No billing profile found, creating default");
          return await createDefaultProfile();
        }

        console.log('Billing profile data retrieved:', data);
        return data;
      } catch (err) {
        console.error('Unexpected error in useBillingProfile:', err);
        toast.error("Failed to load billing information");
        throw err;
      }
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create a default billing profile if one doesn't exist
  const createDefaultProfile = async (): Promise<BillingProfile> => {
    try {
      // Call the edge function to create a profile
      const { error, data } = await supabase.functions.invoke('manage-billing', {
        body: { 
          action: 'create_profile', 
          user_id: user?.id,
          plan: 'standard'
        }
      });
      
      if (error) {
        console.error('Error creating default billing profile:', error);
        throw error;
      }
      
      toast.success("Billing profile created");
      return data.data;
    } catch (err) {
      console.error('Error in createDefaultProfile:', err);
      throw err;
    }
  };

  // Mutation to add credits
  const addCredits = useMutation({
    mutationFn: async (amount: number) => {
      const { data, error } = await supabase.functions.invoke('manage-billing', {
        body: { 
          action: 'add_credits', 
          user_id: user?.id, 
          amount 
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-profile', user?.id] });
      toast.success(`Credits added successfully!`);
    },
    onError: (error) => {
      toast.error(`Failed to add credits: ${error.message}`);
    }
  });

  // Mutation to update the plan
  const updatePlan = useMutation({
    mutationFn: async (plan: 'standard' | 'growth' | 'pro') => {
      const { data, error } = await supabase.functions.invoke('manage-billing', {
        body: { 
          action: 'update_plan', 
          user_id: user?.id, 
          plan 
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-profile', user?.id] });
      toast.success(`Plan updated successfully!`);
    },
    onError: (error) => {
      toast.error(`Failed to update plan: ${error.message}`);
    }
  });

  // Function to get billing history
  const getBillingHistory = async () => {
    try {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('credit_usage_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (err) {
      console.error('Error fetching billing history:', err);
      return [];
    }
  };

  // Function to get subscription status
  const getSubscriptionStatus = async () => {
    if (!profile?.stripe_subscription_id) {
      return null;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { 
          subscription_id: profile.stripe_subscription_id
        }
      });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error checking subscription status:', err);
      return null;
    }
  };

  return {
    profile,
    isLoading,
    error,
    addCredits,
    updatePlan,
    refetch,
    getBillingHistory,
    getSubscriptionStatus
  };
}
