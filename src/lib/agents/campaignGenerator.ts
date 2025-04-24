
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCreditsManager } from "@/hooks/useCreditsManager";
import { useTenant } from "@/hooks/useTenant";
import type { Strategy } from "@/types/strategy";

interface CampaignInput {
  strategyId?: string;
  name: string;
  description?: string;
  channels?: string[];
  audience?: string;
}

interface CampaignScript {
  channel: string;
  content: string;
  headline?: string;
  cta?: string;
}

interface GeneratedCampaign {
  name: string;
  description: string;
  scripts: CampaignScript[];
}

export const generateCampaign = async (input: CampaignInput, tenantId: string, strategy?: Strategy) => {
  try {
    const toastId = toast.loading("Generating campaign...");
    
    // Prepare strategy context if available
    const strategyContext = strategy 
      ? { 
          id: strategy.id,
          title: strategy.title,
          description: strategy.description,
          industry: strategy.industry,
          goal: strategy.goal
        }
      : null;
    
    const response = await supabase.functions.invoke("generate-campaign", {
      body: {
        tenant_id: tenantId,
        campaign_name: input.name,
        campaign_description: input.description,
        channels: input.channels || ["email", "social"],
        audience: input.audience,
        strategy: strategyContext
      }
    });
    
    if (response.error) {
      throw new Error(`Campaign generation failed: ${response.error.message}`);
    }
    
    const generatedCampaign: GeneratedCampaign = response.data;
    
    // Save the campaign to the database
    const { data: campaign, error: saveError } = await supabase
      .from("campaigns")
      .insert({
        name: input.name,
        description: input.description || generatedCampaign.description,
        scripts: generatedCampaign.scripts,
        status: "draft",
        tenant_id: tenantId
      })
      .select()
      .single();
    
    if (saveError) {
      throw saveError;
    }
    
    toast.success("Campaign created successfully", { id: toastId });
    return { success: true, data: campaign };
    
  } catch (err: any) {
    console.error("Campaign generation error:", err);
    toast.error("Failed to generate campaign", {
      description: err.message || "An unexpected error occurred"
    });
    
    return { success: false, error: err.message || "Unknown error" };
  }
};

// React hook for campaign generation
export const useCampaignGenerator = () => {
  const { tenant } = useTenant();
  const { useCredits } = useCreditsManager();
  
  // Generate a campaign with billing integration
  const generateCampaignWithBilling = async (input: CampaignInput, strategy?: Strategy) => {
    if (!tenant?.id) {
      toast.error("Cannot generate campaign", {
        description: "No active workspace found"
      });
      return { success: false, error: "No tenant context" };
    }
    
    // Campaign generation costs 3 credits
    const creditSuccess = await useCredits(3, "Campaign Generation", "Campaign_Agent");
    if (!creditSuccess) {
      toast.error("Not enough credits", {
        description: "You need 3 credits to generate a campaign"
      });
      return { success: false, error: "Insufficient credits" };
    }
    
    return await generateCampaign(input, tenant.id, strategy);
  };
  
  // Generate a campaign based on an existing strategy
  const generateCampaignFromStrategy = async (strategy: Strategy) => {
    if (!strategy) {
      toast.error("No strategy provided");
      return { success: false, error: "No strategy provided" };
    }
    
    const input: CampaignInput = {
      name: `Campaign for ${strategy.title || "Strategy"}`,
      description: `Campaign based on strategy: ${strategy.description?.substring(0, 100) || ""}...`,
      strategyId: strategy.id
    };
    
    return await generateCampaignWithBilling(input, strategy);
  };
  
  return {
    generateCampaign: generateCampaignWithBilling,
    generateCampaignFromStrategy
  };
};
