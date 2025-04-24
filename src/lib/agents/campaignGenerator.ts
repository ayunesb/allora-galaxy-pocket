
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
    
    // Save the campaign to the database with execution tracking fields
    const { data: campaign, error: saveError } = await supabase
      .from("campaigns")
      .insert({
        name: input.name,
        description: input.description || generatedCampaign.description,
        scripts: generatedCampaign.scripts,
        status: "draft",
        tenant_id: tenantId,
        strategy_id: strategy?.id, // Track the source strategy
        execution_status: "pending", // Track execution status
        execution_start_date: null,
        execution_metrics: {
          views: 0,
          clicks: 0,
          conversions: 0,
          last_tracked: new Date().toISOString()
        },
        channels: input.channels || ["email", "social"],
        audience: input.audience || "general"
      })
      .select()
      .single();
    
    if (saveError) {
      throw saveError;
    }

    // Log campaign creation to system logs for tracking
    await supabase
      .from('system_logs')
      .insert({
        tenant_id: tenantId,
        event_type: 'CAMPAIGN_CREATED',
        message: `Campaign "${input.name}" created from strategy "${strategy?.title || 'manual'}"`,
        meta: {
          campaign_id: campaign.id,
          strategy_id: strategy?.id,
          channels: input.channels
        }
      });
    
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
      strategyId: strategy.id,
      channels: ["email", "social", "content"] // Default channels
    };
    
    return await generateCampaignWithBilling(input, strategy);
  };
  
  // Track campaign execution status updates
  const updateCampaignExecutionStatus = async (campaignId: string, status: string, metrics?: Record<string, any>) => {
    if (!tenant?.id || !campaignId) {
      return { success: false, error: "Missing required information" };
    }
    
    try {
      const updatePayload: any = {
        execution_status: status,
      };
      
      if (status === "in_progress" && !metrics?.execution_start_date) {
        updatePayload.execution_start_date = new Date().toISOString();
      }
      
      if (metrics) {
        // Get current metrics to merge with new ones
        const { data: currentCampaign } = await supabase
          .from("campaigns")
          .select("execution_metrics")
          .eq("id", campaignId)
          .single();
          
        updatePayload.execution_metrics = {
          ...currentCampaign?.execution_metrics || {},
          ...metrics,
          last_tracked: new Date().toISOString()
        };
      }
      
      const { error } = await supabase
        .from("campaigns")
        .update(updatePayload)
        .eq("id", campaignId)
        .eq("tenant_id", tenant.id);
      
      if (error) throw error;
      
      // Log status change
      await supabase
        .from('system_logs')
        .insert({
          tenant_id: tenant.id,
          event_type: 'CAMPAIGN_STATUS_UPDATED',
          message: `Campaign status updated to "${status}"`,
          meta: { campaign_id: campaignId, status }
        });
        
      return { success: true };
    } catch (err: any) {
      console.error("Error updating campaign execution status:", err);
      return { success: false, error: err.message };
    }
  };
  
  // Get campaign execution metrics
  const getCampaignExecutionMetrics = async (campaignId: string) => {
    if (!tenant?.id || !campaignId) {
      return { success: false, error: "Missing required information" };
    }
    
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("execution_metrics, execution_status, execution_start_date")
        .eq("id", campaignId)
        .eq("tenant_id", tenant.id)
        .single();
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (err: any) {
      console.error("Error fetching campaign execution metrics:", err);
      return { success: false, error: err.message };
    }
  };
  
  return {
    generateCampaign: generateCampaignWithBilling,
    generateCampaignFromStrategy,
    updateCampaignExecutionStatus,
    getCampaignExecutionMetrics
  };
};
