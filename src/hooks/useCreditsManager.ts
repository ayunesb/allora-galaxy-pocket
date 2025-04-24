
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";
import { toast } from "sonner";

export function useCreditsManager() {
  const { tenant } = useTenant();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCredits, setCurrentCredits] = useState<number>(0);
  
  // Get remaining credits
  const getRemainingCredits = async () => {
    if (!tenant?.id) return 0;
    
    try {
      const { data, error } = await supabase
        .from('billing_profiles')
        .select('credits')
        .eq('user_id', tenant.id)
        .single();
      
      if (error) throw error;
      
      const credits = data?.credits || 0;
      setCurrentCredits(credits);
      return credits;
    } catch (err) {
      console.error("Error retrieving credits:", err);
      return 0;
    }
  };
  
  // Check if user has enough credits
  const hasEnoughCredits = useCallback((requiredAmount: number) => {
    return currentCredits >= requiredAmount;
  }, [currentCredits]);
  
  // Use credits for a feature or operation
  const useCredits = async (amount: number, module: string, agentName: string = "System") => {
    if (!tenant?.id || isProcessing) return false;
    
    setIsProcessing(true);
    try {
      // Use the edge function to apply the deduction
      const { data, error } = await supabase.functions.invoke('manage-billing', {
        body: {
          action: 'use_credits',
          user_id: tenant.id,
          amount
        }
      });
      
      if (error) throw error;
      
      // Log credit usage if successful
      if (data?.success) {
        await supabase.from('credit_usage_log').insert({
          tenant_id: tenant.id,
          agent_name: agentName,
          module,
          credits_used: amount
        });
        
        // Update local credits state
        setCurrentCredits(prev => Math.max(0, prev - amount));
        return true;
      } else {
        toast.error("Insufficient credits");
        return false;
      }
    } catch (err) {
      console.error("Error using credits:", err);
      toast.error("Failed to process credits");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Fetch initial credits when tenant changes
  useEffect(() => {
    if (tenant?.id) {
      getRemainingCredits();
    }
  }, [tenant?.id]);

  return {
    getRemainingCredits,
    useCredits,
    hasEnoughCredits,
    currentCredits,
    isProcessing
  };
}
