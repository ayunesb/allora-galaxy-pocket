
import { toast } from "sonner";
import { useCreditsManager } from "@/hooks/useCreditsManager";
import { useTenant } from "@/hooks/useTenant";
import type { Strategy } from "@/types/strategy";
import { CampaignService } from "@/services/CampaignService";

interface CampaignInput {
  strategyId?: string;
  name: string;
  description?: string;
  channels?: string[];
  audience?: string;
}

export const useCampaignGenerator = () => {
  const { tenant } = useTenant();
  const { useCredits } = useCreditsManager();
  
  const generateCampaignWithBilling = async (input: CampaignInput, strategy?: Strategy) => {
    if (!tenant?.id) {
      toast.error("Cannot generate campaign", {
        description: "No active workspace found"
      });
      return { success: false, error: "No tenant context" };
    }
    
    const creditSuccess = await useCredits(3, "Campaign Generation", "Campaign_Agent");
    if (!creditSuccess) {
      toast.error("Not enough credits", {
        description: "You need 3 credits to generate a campaign"
      });
      return { success: false, error: "Insufficient credits" };
    }
    
    const toastId = toast.loading("Generating campaign...");
    
    try {
      // Generate the campaign
      const result = await CampaignService.generateCampaign(input, tenant.id, strategy);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to generate campaign");
      }
      
      // Save the campaign to the database
      const saveResult = await CampaignService.saveCampaign(result.data, input, tenant.id);
      
      if (!saveResult.success) {
        throw new Error(saveResult.error || "Failed to save campaign");
      }
      
      toast.success("Campaign created successfully", { id: toastId });
      return { success: true, data: saveResult.data };
      
    } catch (err: any) {
      console.error("Campaign generation error:", err);
      toast.error("Failed to generate campaign", {
        description: err.message || "An unexpected error occurred",
        id: toastId
      });
      
      return { success: false, error: err.message || "Unknown error" };
    }
  };
  
  const generateCampaignFromStrategy = async (strategy: Strategy) => {
    if (!strategy) {
      toast.error("No strategy provided");
      return { success: false, error: "No strategy provided" };
    }
    
    const input: CampaignInput = {
      name: `Campaign for ${strategy.title || "Strategy"}`,
      description: `Campaign based on strategy: ${strategy.description?.substring(0, 100) || ""}...`,
      strategyId: strategy.id,
      channels: strategy.channels || ["email", "social", "content"] // Use strategy channels if available
    };
    
    return await generateCampaignWithBilling(input, strategy);
  };
  
  const updateCampaignExecutionStatus = async (campaignId: string, status: string, metrics?: Record<string, any>) => {
    if (!tenant?.id || !campaignId) {
      return { success: false, error: "Missing required information" };
    }
    
    return await CampaignService.updateCampaignExecution(campaignId, tenant.id, status, metrics);
  };
  
  const getCampaignExecutionMetrics = async (campaignId: string) => {
    if (!tenant?.id || !campaignId) {
      return { success: false, error: "Missing required information" };
    }
    
    return await CampaignService.getCampaignExecutionMetrics(campaignId, tenant.id);
  };
  
  return {
    generateCampaign: generateCampaignWithBilling,
    generateCampaignFromStrategy,
    updateCampaignExecutionStatus,
    getCampaignExecutionMetrics
  };
};
