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
      
      const creditsUsed = await useCredits(3, "Campaign Generation", "Campaign_Agent");
      
      if (!creditsUsed) {
        throw new Error("Not enough credits");
      }
      
      try {
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
            execution_status: "pending",
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
        
        if (input.strategy.id) {
          await supabase.from("kpi_insights").insert({
            tenant_id: tenant.id,
            campaign_id: savedCampaign.id,
            kpi_name: "conversion_rate",
            insight: `Campaign "${savedCampaign.name}" launched based on strategy "${input.strategy.title}"`,
            impact_level: "medium",
            outcome: "pending",
            target: 5.0,
            suggested_action: `Monitor performance of campaign "${savedCampaign.name}" derived from strategy "${input.strategy.title}"`
          });
        }
        
        await sendNotification({
          event_type: "campaign_created",
          description: `New campaign "${savedCampaign.name}" has been created and is ready for review`,
        });
        
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
        
      return { success: true };
    } catch (err: any) {
      console.error("Error updating campaign execution status:", err);
      return { success: false, error: err.message };
    }
  };

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

  const trackCampaignOutcome = async (campaignId: string) => {
    if (!tenant?.id) {
      return { success: false, error: "Missing tenant information" };
    }
    
    try {
      const { error } = await supabase.functions.invoke("trackCampaignOutcomes", {
        body: { campaign_id: campaignId, tenant_id: tenant.id }
      });
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['kpi-insights'] });
      
      return { success: true };
    } catch (err: any) {
      console.error("Error tracking campaign outcome:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    isLoading: isLoading || generateCampaign.isPending,
    convertStrategyToCampaign,
    updateCampaignExecutionStatus,
    getCampaignExecutionMetrics,
    trackCampaignOutcome
  };
}
