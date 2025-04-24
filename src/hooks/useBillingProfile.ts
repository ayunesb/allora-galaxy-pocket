
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";
import type { BillingProfile } from "@/types/billing";

export function useBillingProfile() {
  const { tenant } = useTenant();
  const [isUpdating, setIsUpdating] = useState(false);
  
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
  const updatePlan = async (plan: 'standard' | 'growth' | 'pro') => {
    if (!tenant?.id || !profile || isUpdating) return false;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('manage-billing', {
        body: {
          action: 'update_plan',
          user_id: tenant.id,
          plan
        }
      });
      
      if (error) throw error;
      
      // Refresh the profile data
      refetch();
      return true;
    } catch (err) {
      console.error("Error updating billing plan:", err);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    profile,
    isLoading,
    error,
    createProfile,
    updatePlan,
    isUpdating,
    refetch
  };
}
