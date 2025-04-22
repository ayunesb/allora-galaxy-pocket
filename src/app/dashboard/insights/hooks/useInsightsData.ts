
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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

  // Use our new custom hooks
  const { roiData, kpiData } = useRoiMetrics(dateRange);
  const { feedbackPositivityRatio, feedbackStats } = useFeedbackMetrics(dateRange);
  const { campaignApprovalRate, topCampaigns } = useCampaignMetrics(dateRange);
  const { data: kpiHistory, isLoading: isLoadingKpiHistory } = useKpiHistory(dateRange);

  const pluginStats = pluginData ? pluginData.reduce((acc: Record<string, number>, item: any) => {
    acc[item.plugin_key] = (acc[item.plugin_key] || 0) + 1;
    return acc;
  }, {}) : {};

  const isLoading = isLoadingSystemLogs || isLoadingPlugins || isLoadingKpiHistory;

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
    isLoading
  };
}
