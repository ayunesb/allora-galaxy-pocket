
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";
import type { BillingProfile } from "@/types/billing";
import { toast } from "sonner";

export function useBillingProfile() {
  const { tenant } = useTenant();
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();
  
  const { 
    data: profile,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['billing-profile', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;
      
      const { data, error } = await supabase
        .from('billing_profiles')
        .select('*')
        .eq('user_id', tenant.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      return data as BillingProfile;
    },
    enabled: !!tenant?.id
  });
  
  // Create a billing profile if none exists
  const createProfile = async (plan: 'standard' | 'growth' | 'pro' = 'standard') => {
    if (!tenant?.id || isUpdating) return null;
    
    setIsUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-billing', {
        body: {
          action: 'create_profile',
          user_id: tenant.id,
          plan
        }
      });
      
      if (error) throw error;
      
      // Refresh the profile data
      refetch();
      return data;
    } catch (err) {
      console.error("Error creating billing profile:", err);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Update plan type
  const updatePlanMutation = useMutation({
    mutationFn: async (plan: 'standard' | 'growth' | 'pro') => {
      if (!tenant?.id || !profile) return false;
      
      const { error } = await supabase.functions.invoke('manage-billing', {
        body: {
          action: 'update_plan',
          user_id: tenant.id,
          plan
        }
      });
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-profile'] });
      toast.success("Plan updated successfully");
    },
    onError: (error) => {
      console.error("Error updating billing plan:", error);
      toast.error("Failed to update plan");
    }
  });
  
  // Add credits functionality
  const addCreditsMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!tenant?.id || !profile) return false;
      
      const { error } = await supabase.functions.invoke('manage-billing', {
        body: {
          action: 'add_credits',
          user_id: tenant.id,
          amount
        }
      });
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-profile'] });
      toast.success("Credits added successfully");
    },
    onError: (error) => {
      console.error("Error adding credits:", error);
      toast.error("Failed to add credits");
    }
  });

  return {
    profile,
    isLoading,
    error,
    createProfile,
    updatePlan: updatePlanMutation,
    addCredits: addCreditsMutation,
    isUpdating,
    refetch
  };
}
