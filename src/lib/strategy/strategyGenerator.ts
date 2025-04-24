
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTenant } from "@/hooks/useTenant";
import { useCreditsManager } from "@/hooks/useCreditsManager";

interface StrategyInput {
  industry: string;
  goal: string;
  companyName?: string;
}

export const generateStrategy = async (input: StrategyInput, tenantId: string) => {
  try {
    // Start with a loading toast that we'll update
    const toastId = toast.loading("Generating strategy...");
    
    // Call the generate-strategy edge function with retry mechanism
    let attempts = 0;
    let maxAttempts = 2;
    let result = null;
    let error = null;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        if (attempts > 1) {
          toast.loading("Retrying strategy generation...", { id: toastId });
        }
        
        const response = await supabase.functions.invoke("generate-strategy", {
          body: {
            prompt: `Create a business strategy for a ${input.industry} company with the goal of: ${input.goal}`,
            tenant_id: tenantId,
            company_name: input.companyName
          }
        });
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        result = response.data;
        break; // Success, exit loop
      } catch (err: any) {
        error = err;
        console.error(`Strategy generation attempt ${attempts} failed:`, err);
        
        // Only wait before retry if we'll try again
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        }
      }
    }
    
    if (!result) {
      toast.error("Strategy generation failed", { 
        id: toastId,
        description: error?.message || "Something went wrong. Please try again."
      });
      
      // Log the error to Supabase for monitoring
      await supabase.from("system_logs").insert({
        event_type: "STRATEGY_GENERATION_ERROR",
        message: `Failed to generate strategy after ${maxAttempts} attempts`,
        meta: { 
          error: error?.message,
          input
        },
        tenant_id: tenantId
      });
      
      return { success: false, error: error?.message || "Strategy generation failed" };
    }
    
    toast.success("Strategy generated successfully", { id: toastId });
    return { success: true, data: result.strategy };
    
  } catch (err: any) {
    console.error("Strategy generation error:", err);
    toast.error("Failed to generate strategy", {
      description: err.message || "An unexpected error occurred"
    });
    
    return { success: false, error: err.message || "Unknown error" };
  }
};

// React hook for strategy generation with billing integration
export const useStrategyGenerator = () => {
  const { tenant } = useTenant();
  const { useCredits } = useCreditsManager();
  
  const generateStrategyWithBilling = async (input: StrategyInput) => {
    if (!tenant?.id) {
      toast.error("Cannot generate strategy", {
        description: "No active workspace found"
      });
      return { success: false, error: "No tenant context" };
    }
    
    // Strategy generation costs 5 credits
    const creditSuccess = await useCredits(5, "Strategy Generation", "CEO_Agent");
    if (!creditSuccess) {
      toast.error("Not enough credits", {
        description: "You need 5 credits to generate a strategy"
      });
      return { success: false, error: "Insufficient credits" };
    }
    
    return await generateStrategy(input, tenant.id);
  };
  
  return { generateStrategyWithBilling };
};
