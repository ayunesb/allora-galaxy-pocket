import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useEffect, useState } from "react";

export function useInsightsData(dateRange: string) {
  const { tenant } = useTenant();
  const formattedStartDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Define a more explicit type for trend
  type TrendType = 'up' | 'down' | 'neutral';

  const [roiData, setRoiData] = useState<any>(null);
  const [conversionRate, setConversionRate] = useState({ 
    current: 0, 
    trend: 'neutral' as TrendType, 
    change: 0 
  });
  const [campaignApprovalRate, setCampaignApprovalRate] = useState({ 
    current: 0, 
    trend: 'neutral' as TrendType, 
    change: 0 
  });
  const [aiRegenerationVolume, setAiRegenerationVolume] = useState({ 
    current: 0, 
    trend: 'neutral' as TrendType, 
    change: 0 
  });
  const [feedbackPositivityRatio, setFeedbackPositivityRatio] = useState({ 
    current: 0, 
    trend: 'neutral' as TrendType, 
    change: 0 
  });

  const { data: kpiData, isLoading: isLoadingKpi } = useQuery({
    queryKey: ['kpi-metrics-insights', tenant?.id, dateRange],
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

  const { data: kpiHistory, isLoading: isLoadingKpiHistory } = useQuery({
    queryKey: ['kpi-metrics-history', tenant?.id, dateRange],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from('kpi_metrics_history')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('recorded_at', formattedStartDate)
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

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

  useEffect(() => {
    if (!tenant?.id || !kpiData || !kpiHistory) return;

    const revenueMetric = kpiData?.find(m => m.metric.toLowerCase() === 'revenue');
    const costMetric = kpiData?.find(m => m.metric.toLowerCase() === 'cost_spent');
    
    if (revenueMetric && costMetric && parseFloat(costMetric.value) > 0) {
      const revenue = parseFloat(revenueMetric.value);
      const cost = parseFloat(costMetric.value);
      const currentRoi = (revenue - cost) / cost;
      
      const roiHistory = kpiHistory
        .filter(h => h.metric === 'roi')
        .map(h => ({
          date: h.recorded_at,
          value: parseFloat(h.value)
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let trend: 'up' | 'down' | 'neutral' = 'neutral';
      let change = 0;
      
      if (roiHistory.length >= 2) {
        const currentRoiValue = roiHistory[roiHistory.length - 1].value;
        const previousRoiValue = roiHistory[roiHistory.length - 2].value;
        
        change = Math.round(((currentRoiValue - previousRoiValue) / previousRoiValue) * 100);
        trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
      }
      
      setRoiData({
        current: currentRoi,
        trend,
        change,
        history: roiHistory
      });
    }
    
    if (feedbackData && systemLogs) {
      const currentFeedbackApprovals = feedbackData.filter((item: any) => 
        item.action === 'used'
      ).length;
      
      const currentTotalFeedback = feedbackData.length;
      const currentConversionRate = currentTotalFeedback > 0 
        ? Math.round((currentFeedbackApprovals / currentTotalFeedback) * 100) 
        : 0;
      
      const previousPeriodStart = new Date();
      previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(dateRange) * 2);
      const previousPeriodStartFormatted = previousPeriodStart.toISOString();
      
      const getPreviousPeriodData = async () => {
        if (!tenant?.id) return;
        
        const { data: previousFeedback } = await supabase
          .from('strategy_feedback')
          .select('*')
          .eq('tenant_id', tenant.id)
          .gte('created_at', previousPeriodStartFormatted)
          .lt('created_at', formattedStartDate);
          
        if (previousFeedback) {
          const previousApprovals = previousFeedback.filter(item => item.action === 'used').length;
          const previousTotal = previousFeedback.length;
          const previousRate = previousTotal > 0 ? (previousApprovals / previousTotal) * 100 : 0;
          
          const conversionRateChange = previousRate > 0 
            ? Math.round(((currentConversionRate - previousRate) / previousRate) * 100) 
            : 0;
            
          const trend: 'up' | 'down' | 'neutral' = conversionRateChange > 0 ? 'up' : conversionRateChange < 0 ? 'down' : 'neutral';
          
          setConversionRate({
            current: currentConversionRate,
            trend,
            change: conversionRateChange
          });
        }
      };
      
      getPreviousPeriodData();
    }
    
    if (topCampaigns) {
      const approvedCampaigns = topCampaigns.filter(c => c.status === 'active' || c.status === 'delivered').length;
      const totalCampaigns = topCampaigns.length;
      const approvalRate = totalCampaigns > 0 ? Math.round((approvedCampaigns / totalCampaigns) * 100) : 0;
      
      // Explicitly type the trend
      const trend: TrendType = 'neutral';
      
      setCampaignApprovalRate({
        current: approvalRate,
        trend,
        change: 0
      });
    }
    
    if (systemLogs) {
      const regenerationEvents = systemLogs.filter((log: any) => 
        log.event_type === 'strategy_regenerated'
      ).length;
      
      setAiRegenerationVolume({
        current: regenerationEvents,
        trend: 'neutral',
        change: 0
      });
    }
    
    if (feedbackData) {
      const positiveItems = feedbackData.filter((item: any) => item.action === 'used').length;
      const negativeItems = feedbackData.filter((item: any) => item.action === 'dismissed').length;
      const totalFeedback = positiveItems + negativeItems;
      
      const positivityRatio = totalFeedback > 0 
        ? Math.round((positiveItems / totalFeedback) * 100) 
        : 0;
      
      setFeedbackPositivityRatio({
        current: positivityRatio,
        trend: 'neutral',
        change: 0
      });
    }
  }, [tenant?.id, kpiData, kpiHistory, dateRange, feedbackData, systemLogs, topCampaigns, formattedStartDate]);

  const feedbackStats = feedbackData ? {
    used: feedbackData.filter((item: any) => item.action === 'used').length,
    dismissed: feedbackData.filter((item: any) => item.action === 'dismissed').length
  } : { used: 0, dismissed: 0 };

  const pluginStats = pluginData ? pluginData.reduce((acc: Record<string, number>, item: any) => {
    acc[item.plugin_key] = (acc[item.plugin_key] || 0) + 1;
    return acc;
  }, {}) : {};

  const grouped = feedbackData ? feedbackData.reduce((acc: Record<string, {used: number, dismissed: number}>, curr: any) => {
    if (!acc[curr.strategy_title]) {
      acc[curr.strategy_title] = { used: 0, dismissed: 0 };
    }
    if (curr.action === 'used' || curr.action === 'dismissed') {
      acc[curr.strategy_title][curr.action]++;
    }
    return acc;
  }, {}) : {};

  useEffect(() => {
    if (!tenant?.id) return;
    
    const feedbackChannel = supabase
      .channel('realtime_feedback')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'strategy_feedback',
        filter: `tenant_id=eq.${tenant.id}`
      }, () => {
        // Invalidate the query to refetch data
      })
      .subscribe();
    
    const pluginChannel = supabase
      .channel('realtime_plugins')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'plugin_usage_logs',
        filter: `tenant_id=eq.${tenant.id}`
      }, () => {
        // Invalidate the query to refetch data
      })
      .subscribe();
    
    const logsChannel = supabase
      .channel('realtime_logs')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'system_logs',
        filter: `tenant_id=eq.${tenant.id}`
      }, () => {
        // Invalidate the query to refetch data
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(feedbackChannel);
      supabase.removeChannel(pluginChannel);
      supabase.removeChannel(logsChannel);
    };
  }, [tenant?.id]);

  const isLoading = isLoadingKpi || isLoadingFeedback || isLoadingPlugins || isLoadingCampaigns || isLoadingKpiHistory || isLoadingSystemLogs;

  return {
    kpiData,
    feedbackStats,
    pluginStats,
    topCampaigns,
    grouped,
    roiData,
    conversionRate,
    campaignApprovalRate,
    aiRegenerationVolume,
    feedbackPositivityRatio,
    isLoading
  };
}
