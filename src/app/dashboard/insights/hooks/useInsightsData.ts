
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

export function useInsightsData(dateRange: string) {
  const { tenant } = useTenant();
  const formattedStartDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Fetch KPI metrics
  const { data: kpiData, isLoading: isLoadingKpi } = useQuery({
    queryKey: ['kpi-metrics-insights', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenant.id);

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  // Fetch strategy feedback data
  const { data: feedbackData, isLoading: isLoadingFeedback } = useQuery({
    queryKey: ['strategy-feedback', tenant?.id, dateRange],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from('strategy_feedback')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('created_at', formattedStartDate);

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  // Fetch plugin usage logs
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

  // Fetch top campaigns
  const { data: topCampaigns, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['top-campaigns', tenant?.id, dateRange],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('created_at', formattedStartDate)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  // Process feedback data for the chart
  const feedbackStats = feedbackData ? {
    used: feedbackData.filter(item => item.action === 'used').length,
    dismissed: feedbackData.filter(item => item.action === 'dismissed').length
  } : { used: 0, dismissed: 0 };

  // Process plugin data
  const pluginStats = pluginData ? pluginData.reduce((acc: Record<string, number>, item: any) => {
    acc[item.plugin_key] = (acc[item.plugin_key] || 0) + 1;
    return acc;
  }, {}) : {};

  // Process feedback data for grouping
  const grouped = feedbackData ? feedbackData.reduce((acc: Record<string, {used: number, dismissed: number}>, curr: any) => {
    if (!acc[curr.strategy_title]) {
      acc[curr.strategy_title] = { used: 0, dismissed: 0 };
    }
    if (curr.action === 'used' || curr.action === 'dismissed') {
      acc[curr.strategy_title][curr.action]++;
    }
    return acc;
  }, {}) : {};

  const isLoading = isLoadingKpi || isLoadingFeedback || isLoadingPlugins || isLoadingCampaigns;

  return {
    kpiData,
    feedbackStats,
    pluginStats,
    topCampaigns,
    grouped,
    isLoading
  };
}
