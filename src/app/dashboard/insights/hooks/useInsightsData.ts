import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useKpiHistory } from "./useKpiHistory";
import { useFeedbackMetrics } from "./useFeedbackMetrics";
import { useCampaignMetrics } from "./useCampaignMetrics";
import { useRoiMetrics } from "./useRoiMetrics";

export function useInsightsData(dateRange: string) {
  const { tenant } = useTenant();
  const [conversionRate, setConversionRate] = useState({ 
    current: 0, 
    trend: 'neutral' as const, 
    change: 0 
  });
  const [aiRegenerationVolume, setAiRegenerationVolume] = useState({ 
    current: 0, 
    trend: 'neutral' as const, 
    change: 0 
  });

  // Use our specialized hooks
  const { data: kpiData, isLoading: isLoadingKpiData } = useKpiHistory(dateRange);
  const { feedbackPositivityRatio, feedbackStats } = useFeedbackMetrics(dateRange);
  const { campaignApprovalRate, topCampaigns } = useCampaignMetrics(dateRange);
  const { roiData } = useRoiMetrics(dateRange);

  // Format start date for queries
  const formattedStartDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data: systemLogs, isLoading: isLoadingSystemLogs } = useQuery({
    queryKey: ['system-logs', tenant?.id, dateRange],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('created_at', formattedStartDate);

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  const { data: pluginData, isLoading: isLoadingPlugins } = useQuery({
    queryKey: ['plugin-usage', tenant?.id, dateRange],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from('plugin_usage_logs')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('created_at', formattedStartDate);

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  const pluginStats = pluginData ? pluginData.reduce((acc: Record<string, number>, item: any) => {
    acc[item.plugin_key] = (acc[item.plugin_key] || 0) + 1;
    return acc;
  }, {}) : {};

  return {
    kpiData,
    feedbackStats,
    pluginStats,
    topCampaigns,
    roiData,
    conversionRate,
    campaignApprovalRate,
    aiRegenerationVolume,
    feedbackPositivityRatio,
    isLoading: isLoadingSystemLogs || isLoadingPlugins || isLoadingKpiData
  };
}
