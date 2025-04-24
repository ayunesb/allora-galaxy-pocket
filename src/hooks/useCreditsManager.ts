
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";

interface CreditUsage {
  module: string;
  agent: string;
  credits: number;
  description?: string;
}

export function useCreditsManager() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  /**
   * Use credits from the tenant's balance
   * @param amount Number of credits to use
   * @param description Description of what the credits are used for
   * @param agent Name of the agent consuming the credits
   * @returns boolean indicating if credits were successfully used
   */
  const useCredits = async (
    amount: number, 
    description: string,
    agent: string = "System"
  ): Promise<boolean> => {
    if (!tenant?.id) {
      toast.error("Cannot use credits", {
        description: "No active workspace found"
      });
      return false;
    }
    
    setIsLoading(true);
    try {
      // First check if tenant has enough credits
      const { data: tenantData, error: tenantError } = await supabase
        .from("tenant_profiles")
        .select("usage_credits")
        .eq("id", tenant.id)
        .single();
      
      if (tenantError) throw tenantError;
      
      const currentCredits = tenantData?.usage_credits || 0;
      
      if (currentCredits < amount) {
        toast.error("Not enough credits", {
          description: `This operation requires ${amount} credits. Your workspace has ${currentCredits} credits.`
        });
        return false;
      }
      
      // Update tenant credits
      const { error: updateError } = await supabase
        .from("tenant_profiles")
        .update({ usage_credits: currentCredits - amount })
        .eq("id", tenant.id);
      
      if (updateError) throw updateError;
      
      // Log credit usage
      const { error: logError } = await supabase
        .from("credit_usage_log")
        .insert({
          tenant_id: tenant.id,
          agent_name: agent,
          module: description,
          credits_used: amount,
          details: {
            user_id: user?.id,
            timestamp: new Date().toISOString()
          }
        });
      
      if (logError) {
        console.error("Error logging credit usage:", logError);
        // We don't throw here to avoid reversing the credit deduction
      }
      
      return true;
      
    } catch (error: any) {
      console.error("Error using credits:", error);
      toast.error("Failed to use credits", {
        description: error.message || "An unexpected error occurred"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Add credits to the tenant's balance
   * @param amount Number of credits to add
   */
  const addCredits = async (amount: number): Promise<boolean> => {
    if (!tenant?.id) {
      toast.error("Cannot add credits", {
        description: "No active workspace found"
      });
      return false;
    }
    
    try {
      // Get current credit balance
      const { data: tenantData, error: tenantError } = await supabase
        .from("tenant_profiles")
        .select("usage_credits")
        .eq("id", tenant.id)
        .single();
      
      if (tenantError) throw tenantError;
      
      const currentCredits = tenantData?.usage_credits || 0;
      
      // Update tenant credits
      const { error: updateError } = await supabase
        .from("tenant_profiles")
        .update({ usage_credits: currentCredits + amount })
        .eq("id", tenant.id);
      
      if (updateError) throw updateError;
      
      toast.success(`Added ${amount} credits`, {
        description: `Your workspace now has ${currentCredits + amount} credits.`
      });
      
      return true;
    } catch (error: any) {
      console.error("Error adding credits:", error);
      toast.error("Failed to add credits", {
        description: error.message || "An unexpected error occurred"
      });
      return false;
    }
  };
  
  /**
   * Check if tenant has enough credits for an operation
   * @param amount Number of credits required
   * @returns boolean indicating if tenant has enough credits
   */
  const hasEnoughCredits = async (amount: number): Promise<boolean> => {
    if (!tenant?.id) return false;
    
    try {
      const { data: tenantData, error: tenantError } = await supabase
        .from("tenant_profiles")
        .select("usage_credits")
        .eq("id", tenant.id)
        .single();
      
      if (tenantError) throw tenantError;
      
      return (tenantData?.usage_credits || 0) >= amount;
    } catch (error) {
      console.error("Error checking credits:", error);
      return false;
    }
  };
  
  /**
   * Get the remaining credits for the current tenant
   * @returns number of remaining credits
   */
  const getRemainingCredits = async (): Promise<number> => {
    if (!tenant?.id) return 0;
    
    try {
      const { data: tenantData, error: tenantError } = await supabase
        .from("tenant_profiles")
        .select("usage_credits")
        .eq("id", tenant.id)
        .single();
      
      if (tenantError) throw tenantError;
      
      // Ensure we return a numeric value
      return Number(tenantData?.usage_credits || 0);
    } catch (error) {
      console.error("Error getting remaining credits:", error);
      return 0;
    }
  };
  
  /**
   * Get credit usage by module
   */
  const getCreditUsageByModule = async (): Promise<{module: string, credits: number}[]> => {
    if (!tenant?.id) return [];
    
    try {
      // Using SQL aggregate function in the query to get sum of credits by module
      const { data, error } = await supabase
        .from('credit_usage_log')
        .select(`
          module,
          sum:credits_used
        `)
        .eq('tenant_id', tenant.id)
        .order('module');
      
      if (error) throw error;
      
      // Transform data into required format
      return (data || []).map(item => ({
        module: item.module,
        credits: item.sum
      }));
      
    } catch (error) {
      console.error("Error fetching credit usage by module:", error);
      return [];
    }
  };
  
  return {
    useCredits,
    addCredits,
    getCreditUsageByModule,
    isLoading,
    hasEnoughCredits,
    getRemainingCredits
  };
}
