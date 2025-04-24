
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useCreditsManager() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get current credit balance
  const { data: billingProfile, isLoading } = useQuery({
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
      
      return data;
    },
    enabled: !!tenant?.id,
  });

  // Use credits for an operation
  const useCredits = async (amount: number, operation: string, agent: string = 'System') => {
    if (!tenant?.id || !user?.id) {
      toast.error("No active workspace", { 
        description: "Please select a workspace first" 
      });
      return false;
    }
    
    if (isProcessing) return false;
    setIsProcessing(true);
    
    try {
      // Call the edge function to use credits
      const { error, data } = await supabase.functions.invoke('manage-billing', {
        body: {
          action: 'use_credits',
          user_id: tenant.id,
          amount
        }
      });
      
      if (error) throw error;
      
      // If credits were used successfully, log the usage
      if (data?.success) {
        await supabase.from('credit_usage_logs').insert({
          tenant_id: tenant.id,
          user_id: user.id,
          credits_used: amount,
          operation,
          agent
        });
        
        // Report usage to Stripe for billing if applicable
        try {
          await supabase.functions.invoke('report-stripe-usage', {
            body: {
              tenant_id: tenant.id,
              credits_used: amount,
              timestamp: Math.floor(Date.now() / 1000)
            }
          });
        } catch (stripeError) {
          console.error("Error reporting usage to Stripe:", stripeError);
          // Non-blocking error - we don't want to fail the operation if Stripe reporting fails
        }
        
        // Invalidate billing profile query to refresh credit balance
        queryClient.invalidateQueries({ queryKey: ['billing-profile'] });
        return true;
      } else {
        toast.error("Insufficient credits", {
          description: `You need at least ${amount} credits for this operation`
        });
        return false;
      }
    } catch (error) {
      console.error("Error using credits:", error);
      toast.error("Failed to process credits");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if enough credits are available
  const hasEnoughCredits = (amount: number): boolean => {
    if (!billingProfile) return false;
    return billingProfile.credits >= amount;
  };

  // Get remaining credits
  const getRemainingCredits = async (): Promise<number> => {
    if (!tenant?.id) return 0;
    
    try {
      const { data, error } = await supabase
        .from('billing_profiles')
        .select('credits')
        .eq('user_id', tenant.id)
        .single();
        
      if (error) throw error;
      return data?.credits || 0;
    } catch (error) {
      console.error("Error fetching remaining credits:", error);
      return 0;
    }
  };

  return {
    isLoading,
    useCredits,
    hasEnoughCredits,
    getRemainingCredits,
    currentCredits: billingProfile?.credits || 0
  };
}
