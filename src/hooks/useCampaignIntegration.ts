
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
            }, {})
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
        
        return true;
      } catch (error) {
        console.error("Error tracking campaign outcome:", error);
        throw error;
      }
    }
  });

  return {
    isLoading: isLoading || generateCampaign.isPending || trackCampaignOutcome.isPending,
    convertStrategyToCampaign,
    trackCampaignOutcome: trackCampaignOutcome.mutate
  };
}
