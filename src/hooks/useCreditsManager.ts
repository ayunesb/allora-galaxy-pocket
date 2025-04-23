
import { useState } from 'react';
import { useBillingProfile } from './useBillingProfile';
import { useStripeUsageReporting } from './useStripeUsageReporting';
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from './useTenant';
import { toast } from "sonner";

export function useCreditsManager() {
  const { profile, isLoading, error, refetch } = useBillingProfile();
  const { reportCreditUsage } = useStripeUsageReporting();
  const { tenant } = useTenant();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Use credits for a specific feature
   * 
   * @param amount Number of credits to use
   * @param feature Feature using the credits
   * @param agent Optional agent name
   * @returns boolean Success status
   */
  const useCredits = async (amount: number, feature: string, agent?: string): Promise<boolean> => {
    if (isLoading || !profile || !tenant?.id) {
      toast.error("Unable to use credits", {
        description: "Your billing profile is loading or not available"
      });
      return false;
    }
    
    if (profile.credits < amount) {
      toast.error("Not enough credits", {
        description: `You need ${amount} credits for this operation but only have ${profile.credits} left`
      });
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      // 1. Use credits via the manage-billing edge function
      const { error: usageError } = await supabase.functions.invoke("manage-billing", {
        body: {
          action: "use_credits",
          user_id: profile.user_id,
          amount: amount
        }
      });
      
      if (usageError) {
        throw usageError;
      }
      
      // 2. Log credit usage
      const { error: logError } = await supabase.from("credit_usage_log").insert({
        tenant_id: tenant.id,
        credits_used: amount,
        module: feature,
        agent_name: agent || "System",
        details: {
          timestamp: new Date().toISOString(),
          feature: feature
        }
      });
      
      if (logError) {
        console.error("Error logging credit usage:", logError);
      }
      
      // 3. Report to Stripe for metering (optional, only if connected)
      if (profile?.stripe_subscription_id) {
        await reportCreditUsage(amount);
      }
      
      // 4. Invalidate the billing profile to update the UI
      refetch();
      
      toast.success(`${amount} credits used`, {
        description: `Used for ${feature}`
      });
      
      return true;
    } catch (err) {
      console.error("Error using credits:", err);
      
      toast.error("Failed to use credits", {
        description: "Please try again or contact support"
      });
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Check if a user has enough credits for an operation
   * 
   * @param requiredAmount Number of credits required
   * @returns boolean Whether the user has enough credits
   */
  const hasEnoughCredits = (requiredAmount: number): boolean => {
    if (isLoading || !profile) return false;
    return profile.credits >= requiredAmount;
  };
  
  /**
   * Get the remaining credits for the user
   * 
   * @returns number The number of credits remaining
   */
  const getRemainingCredits = (): number => {
    return profile?.credits || 0;
  };
  
  /**
   * Get credit usage summary for the current tenant
   */
  const getCreditUsageSummary = async () => {
    if (!tenant?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('tenant_billing_summary')
        .select('*')
        .eq('tenant_id', tenant.id)
        .single();
        
      if (error) {
        console.error("Error fetching credit usage summary:", error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error("Error in getCreditUsageSummary:", err);
      return null;
    }
  };
  
  /**
   * Get detailed credit usage by module
   */
  const getCreditUsageByModule = async () => {
    if (!tenant?.id) return [];
    
    try {
      const { data, error } = await supabase
        .from('credit_usage_log')
        .select('module, sum(credits_used)')
        .eq('tenant_id', tenant.id)
        .group('module')
        .order('sum', { ascending: false });
        
      if (error) {
        console.error("Error fetching credit usage by module:", error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error("Error in getCreditUsageByModule:", err);
      return [];
    }
  };

  return {
    useCredits,
    hasEnoughCredits,
    getRemainingCredits,
    getCreditUsageSummary,
    getCreditUsageByModule,
    isLoading,
    isProcessing,
    error
  };
}
