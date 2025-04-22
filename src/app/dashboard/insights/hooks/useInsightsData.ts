
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useEffect, useState } from "react";

export function useInsightsData(dateRange: string) {
  const { tenant } = useTenant();
  const formattedStartDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [roiData, setRoiData] = useState<any>(null);
  const [conversionRate, setConversionRate] = useState({ current: 0, trend: 'neutral' as const, change: 0 });
  const [campaignApprovalRate, setCampaignApprovalRate] = useState({ current: 0, trend: 'neutral' as const, change: 0 });
  const [aiRegenerationVolume, setAiRegenerationVolume] = useState({ current: 0, trend: 'neutral' as const, change: 0 });
  const [feedbackPositivityRatio, setFeedbackPositivityRatio] = useState({ current: 0, trend: 'neutral' as const, change: 0 });

  // Fetch KPI metrics
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

  // Fetch KPI history for trends
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

  // Fetch system logs for AI regeneration volume
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

  // Calculate ROI and other metrics
  useEffect(() => {
    if (!tenant?.id || !kpiData || !kpiHistory) return;

    // Extract revenue and cost data
    const revenueMetric = kpiData?.find(m => m.metric.toLowerCase() === 'revenue');
    const costMetric = kpiData?.find(m => m.metric.toLowerCase() === 'cost_spent');
    
    if (revenueMetric && costMetric && parseFloat(costMetric.value) > 0) {
      const revenue = parseFloat(revenueMetric.value);
      const cost = parseFloat(costMetric.value);
      const currentRoi = (revenue - cost) / cost;
      
      // Calculate ROI history for trend line
      const roiHistory = kpiHistory
        .filter(h => h.metric === 'roi')
        .map(h => ({
          date: h.recorded_at,
          value: parseFloat(h.value)
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Calculate trend (comparing current to previous period)
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
    
    // Calculate Conversion Rate
    if (feedbackData && systemLogs) {
      // Current period
      const currentFeedbackApprovals = feedbackData.filter((item: any) => 
        item.action === 'used'
      ).length;
      
      const currentTotalFeedback = feedbackData.length;
      const currentConversionRate = currentTotalFeedback > 0 
        ? Math.round((currentFeedbackApprovals / currentTotalFeedback) * 100) 
        : 0;
      
      // Previous period
      const previousPeriodStart = new Date();
      previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(dateRange) * 2);
      const previousPeriodStartFormatted = previousPeriodStart.toISOString();
      
      // Get previous period data
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
          
          // Calculate change
          const conversionRateChange = previousRate > 0 
            ? Math.round(((currentConversionRate - previousRate) / previousRate) * 100) 
            : 0;
            
          setConversionRate({
            current: currentConversionRate,
            trend: conversionRateChange > 0 ? 'up' : conversionRateChange < 0 ? 'down' : 'neutral',
            change: conversionRateChange
          });
        }
      };
      
      getPreviousPeriodData();
    }
    
    // Calculate Campaign Approval Rate
    if (topCampaigns) {
      const approvedCampaigns = topCampaigns.filter(c => c.status === 'active' || c.status === 'delivered').length;
      const totalCampaigns = topCampaigns.length;
      const approvalRate = totalCampaigns > 0 ? Math.round((approvedCampaigns / totalCampaigns) * 100) : 0;
      
      setCampaignApprovalRate({
        current: approvalRate,
        trend: 'neutral',
        change: 0
      });
    }
    
    // Calculate AI Regeneration Volume
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
    
    // Calculate Feedback Positivity Ratio
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

  // Process feedback data for the chart
  const feedbackStats = feedbackData ? {
    used: feedbackData.filter((item: any) => item.action === 'used').length,
    dismissed: feedbackData.filter((item: any) => item.action === 'dismissed').length
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

  // Subscribe to real-time updates for feedback, logs, and plugin usage
  useEffect(() => {
    if (!tenant?.id) return;
    
    // Create a channel for feedback updates
    const feedbackChannel = supabase
      .channel('realtime_feedback')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'strategy_feedback',
        filter: `tenant_id=eq.${tenant.id}`
      }, () => {
        // Invalidate the query to refetch data
        // Since we're using React Query, this will trigger a refetch
      })
      .subscribe();
    
    // Create a channel for plugin usage logs
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
    
    // Create a channel for system logs
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
    
    // Cleanup function
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
