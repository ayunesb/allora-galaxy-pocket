
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

export class CampaignService {
  /**
   * Generates a campaign based on input parameters
   */
  static async generateCampaign(input: CampaignInput, tenantId: string, strategy?: Strategy) {
    try {
      // Prepare strategy context if available
      const strategyContext = strategy 
        ? { 
            id: strategy.id,
            title: strategy.title,
            description: strategy.description,
            industry: strategy.industry || undefined,
            goal: strategy.goal || (Array.isArray(strategy.goals) ? strategy.goals[0] : undefined)
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
      
      return { success: true, data: response.data as GeneratedCampaign };
      
    } catch (err: any) {
      console.error("Campaign generation error:", err);
      return { success: false, error: err.message || "Unknown error" };
    }
  }

  /**
   * Saves a campaign to the database
   */
  static async saveCampaign(campaign: GeneratedCampaign, input: CampaignInput, tenantId: string) {
    try {
      // Save the campaign to the database with execution tracking fields
      const { data, error: saveError } = await supabase
        .from("campaigns")
        .insert({
          name: input.name,
          description: input.description || campaign.description,
          scripts: campaign.scripts,
          status: "draft",
          tenant_id: tenantId,
          strategy_id: input.strategyId, // Track the source strategy
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
          message: `Campaign "${input.name}" created${input.strategyId ? ' from strategy' : ''}`,
          meta: {
            campaign_id: data.id,
            strategy_id: input.strategyId,
            channels: input.channels
          }
        });
      
      return { success: true, data };
    } catch (err: any) {
      console.error("Error saving campaign:", err);
      return { success: false, error: err.message || "Unknown error" };
    }
  }

  /**
   * Updates campaign execution status and metrics
   */
  static async updateCampaignExecution(campaignId: string, tenantId: string, status: string, metrics?: Record<string, any>) {
    try {
      const updatePayload: any = {
        execution_status: status,
      };
      
      if (status === "in_progress" || status === "running") {
        updatePayload.execution_start_date = new Date().toISOString();
      }
      
      if (metrics) {
        const { data: currentCampaign, error: fetchError } = await supabase
          .from("campaigns")
          .select("execution_metrics")
          .eq("id", campaignId)
          .eq("tenant_id", tenantId)
          .single();
          
        if (fetchError) throw fetchError;
        
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
        .eq("tenant_id", tenantId);
      
      if (error) throw error;
      
      await supabase
        .from('system_logs')
        .insert({
          tenant_id: tenantId,
          event_type: 'CAMPAIGN_STATUS_UPDATED',
          message: `Campaign status updated to "${status}"`,
          meta: { campaign_id: campaignId, status }
        });
        
      return { success: true };
    } catch (err: any) {
      console.error("Error updating campaign execution:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get campaign execution metrics
   */
  static async getCampaignExecutionMetrics(campaignId: string, tenantId: string) {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("execution_metrics, execution_status, execution_start_date")
        .eq("id", campaignId)
        .eq("tenant_id", tenantId)
        .maybeSingle();
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (err: any) {
      console.error("Error fetching campaign metrics:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Track campaign outcome
   */
  static async trackCampaignOutcome(
    campaignId: string,
    tenantId: string,
    userId: string,
    outcomeType: string,
    outcomeValue: number,
    outcomeDetails?: Record<string, any>
  ) {
    try {
      // Update the campaign's execution metrics
      const { data: campaign, error: fetchError } = await supabase
        .from("campaigns")
        .select("execution_metrics")
        .eq("id", campaignId)
        .eq("tenant_id", tenantId)
        .maybeSingle();
        
      if (fetchError) throw fetchError;
      
      // Create new metrics object with updated values
      const currentMetrics = campaign?.execution_metrics || {};
      const updatedMetrics = {
        ...currentMetrics,
        [outcomeType]: (currentMetrics[outcomeType] || 0) + outcomeValue,
        last_updated: new Date().toISOString()
      };
      
      // Update campaign metrics
      const { error: updateError } = await supabase
        .from("campaigns")
        .update({
          execution_metrics: updatedMetrics
        })
        .eq("id", campaignId)
        .eq("tenant_id", tenantId);
        
      if (updateError) throw updateError;
      
      // Insert record into campaign_outcomes table
      const { error } = await supabase
        .from('campaign_outcomes')
        .insert({
          campaign_id: campaignId,
          tenant_id: tenantId,
          outcome_type: outcomeType,
          outcome_value: outcomeValue,
          details: outcomeDetails || {},
          recorded_by: userId
        });

      if (error) throw error;
      
      return { success: true };
    } catch (err: any) {
      console.error("Error tracking campaign outcome:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Generate prediction for campaign performance
   */
  static async generateCampaignReport(campaignId: string, tenantId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('predict-campaign-performance', {
        body: {
          campaign_id: campaignId,
          tenant_id: tenantId
        }
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (err: any) {
      console.error('Error generating campaign report:', err);
      return { success: false, error: err.message };
    }
  }
}
