
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/campaign";
import { format } from "date-fns";

export function useCampaignPerformance() {
  const queryClient = useQueryClient();

  const { data: campaignPerformance = [], isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['campaign-performance-data'],
    queryFn: async () => {
      const { data: campaigns, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (campaignError) throw campaignError;
      
      const campaignsWithInsights = await Promise.all(campaigns.map(async (campaign) => {
        const { data: insights, error: insightError } = await supabase
          .from('kpi_insights')
          .select('*')
          .eq('campaign_id', campaign.id);
        
        if (insightError) {
          console.error("Error fetching insights:", insightError);
          return { ...campaign, insights: [] };
        }
        
        return { ...campaign, insights: insights || [] };
      }));
      
      return campaignsWithInsights;
    }
  });

  const { data: kpiMetrics = [], isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['campaign-kpi-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kpi_metrics')
        .select('*')
        .order('recorded_at', { ascending: true });
      
      if (error) throw error;
      
      const metricsByName: Record<string, any[]> = {};
      data.forEach(metric => {
        if (!metricsByName[metric.metric]) {
          metricsByName[metric.metric] = [];
        }
        
        metricsByName[metric.metric].push({
          date: format(new Date(metric.recorded_at), 'MM/dd'),
          value: metric.value
        });
      });
      
      return Object.entries(metricsByName).map(([name, values]) => ({
        name,
        data: values
      }));
    }
  });

  return {
    campaignPerformance,
    kpiMetrics,
    isLoading: isLoadingCampaigns || isLoadingMetrics,
  };
}
