
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";
import { useCreditsManager } from "./useCreditsManager";
import { useNotifications } from "./useNotifications";
import { toast } from "sonner";
import type { Strategy } from "@/types/strategy";

interface CampaignInput {
  name: string;
  description?: string;
  channels?: string[];
  strategyId?: string;
}

export function useCampaignIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();
  const { useCredits } = useCreditsManager();
  const { sendNotification } = useNotifications();
  const queryClient = useQueryClient();

  const generateCampaign = useMutation({
    mutationFn: async (input: { strategy: Strategy, channels: string[] }) => {
      if (!tenant?.id) {
        throw new Error("No workspace selected");
      }
      
      setIsLoading(true);
      
      // Deduct credits
      const creditsUsed = await useCredits(3, "Campaign Generation", "Campaign_Agent");
      
      if (!creditsUsed) {
        throw new Error("Not enough credits");
      }
      
      try {
        // Call the edge function to generate campaign content
        const { data: campaignData, error: genError } = await supabase.functions.invoke("generate-campaign", {
          body: {
            tenant_id: tenant.id,
            campaign_name: `Campaign for: ${input.strategy.title}`,
            campaign_description: input.strategy.description,
            channels: input.channels || ["email", "social"],
            audience: "general",
            strategy: {
              id: input.strategy.id,
              title: input.strategy.title,
              description: input.strategy.description,
              industry: input.strategy.industry,
              goal: input.strategy.goal
            }
          }
        });
        
        if (genError) throw genError;
        
        // Save campaign to database
        const { data: savedCampaign, error: saveError } = await supabase
          .from("campaigns")
          .insert({
            tenant_id: tenant.id,
            name: campaignData.name,
            description: campaignData.description,
            status: "draft",
            scripts: campaignData.scripts.reduce((acc: Record<string, string>, curr: any) => {
              acc[curr.channel] = curr.content;
              return acc;
            }, {}),
            execution_status: "pending", // Initialize execution status
            execution_metrics: {
              views: 0,
              clicks: 0,
              conversions: 0,
              last_tracked: new Date().toISOString()
            }
          })
          .select()
          .single();
        
        if (saveError) throw saveError;
        
        // Link campaign to strategy by updating the strategy
        if (input.strategy.id) {
          // Create KPI insight to track campaign effectiveness
          await supabase.from("kpi_insights").insert({
            tenant_id: tenant.id,
            campaign_id: savedCampaign.id,
            kpi_name: "conversion_rate",
            insight: `Campaign "${savedCampaign.name}" launched based on strategy "${input.strategy.title}"`,
            impact_level: "medium",
            outcome: "pending",
            target: 5.0, // Setting a default target value of 5% conversion
            suggested_action: `Monitor performance of campaign "${savedCampaign.name}" derived from strategy "${input.strategy.title}"`
          });
          
          // Add feedback collection for the strategy
          await supabase.from("strategy_feedback").insert({
            tenant_id: tenant.id,
            strategy_title: input.strategy.title,
            action: `Created campaign "${savedCampaign.name}" with channels: ${input.channels.join(', ')}`
          });
        }
        
        // Send notification about new campaign
        await sendNotification({
          event_type: "campaign_created",
          description: `New campaign "${savedCampaign.name}" has been created and is ready for review`,
        });
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        
        return savedCampaign;
      } catch (error: any) {
        console.error("Error generating campaign:", error);
        throw new Error(error.message || "Failed to generate campaign");
      } finally {
        setIsLoading(false);
      }
    }
  });

  const convertStrategyToCampaign = async (strategy: Strategy, channels: string[] = ["email", "social"]) => {
    try {
      await generateCampaign.mutateAsync({ strategy, channels });
      
      toast.success("Campaign successfully generated", {
        description: "You can now review and approve it in the Campaign Center"
      });
      
      return true;
    } catch (error: any) {
      toast.error("Campaign generation failed", {
        description: error.message || "An unexpected error occurred"
      });
      return false;
    }
  };

  const trackCampaignOutcome = useMutation({
    mutationFn: async (campaignId: string) => {
      if (!tenant?.id) {
        throw new Error("No workspace selected");
      }
      
      try {
        // Call the edge function to trigger KPI tracking for this campaign
        const { error } = await supabase.functions.invoke("trackCampaignOutcomes", {
          body: { campaign_id: campaignId, tenant_id: tenant.id }
        });
        
        if (error) throw error;
        
        // Invalidate KPI metrics queries
        queryClient.invalidateQueries({ queryKey: ["kpi-metrics"] });
        queryClient.invalidateQueries({ queryKey: ["kpi-alerts"] });
        queryClient.invalidateQueries({ queryKey: ["campaign-insights"] });
        
        return true;
      } catch (error) {
        console.error("Error tracking campaign outcome:", error);
        throw error;
      }
    }
  });
  
  // Capture feedback on campaign performance to improve future strategies
  const captureCampaignFeedback = useMutation({
    mutationFn: async (input: { 
      campaignId: string, 
      strategyId: string, 
      feedback: string, 
      performanceRating: number 
    }) => {
      if (!tenant?.id) {
        throw new Error("No workspace selected");
      }
      
      try {
        // Log feedback for strategy improvement
        await supabase.from("agent_feedback").insert({
          tenant_id: tenant.id,
          agent: "Campaign_Agent",
          feedback: input.feedback,
          rating: input.performanceRating,
          type: "campaign_performance_feedback",
          task_id: input.strategyId
        });
        
        // Add status update to the strategy
        await supabase.from("strategy_feedback").insert({
          tenant_id: tenant.id,
          strategy_title: "Strategy ID: " + input.strategyId,
          action: `Campaign performance feedback: ${input.feedback} (Rating: ${input.performanceRating}/5)`
        });
        
        // Notify about feedback
        await sendNotification({
          event_type: "campaign_feedback",
          description: `New feedback recorded for campaign performance (${input.performanceRating}/5)`
        });
        
        return true;
      } catch (error) {
        console.error("Error capturing campaign feedback:", error);
        throw error;
      }
    }
  });

  // Add the missing methods for campaign execution tracking
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
    isLoading: isLoading || generateCampaign.isPending || trackCampaignOutcome.isPending || captureCampaignFeedback.isPending,
    convertStrategyToCampaign,
    trackCampaignOutcome: trackCampaignOutcome.mutate,
    captureCampaignFeedback: captureCampaignFeedback.mutate,
    updateCampaignExecutionStatus,
    getCampaignExecutionMetrics
  };
}
