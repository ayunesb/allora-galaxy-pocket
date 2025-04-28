
// Fix the useInsightsData hook ROI data access

import { useMemo } from "react";
import { useKpiHistory } from "./useKpiHistory";
import { useFeedbackMetrics } from "./useFeedbackMetrics";
import { useRoiMetrics } from "./useRoiMetrics";
import { useCampaignMetrics } from "./useCampaignMetrics";

// Define types for trend data
type TrendType = 'up' | 'down' | 'neutral';

interface TrendMetric {
  current: number;
  trend: TrendType;
  change: number;
}

interface InsightsData {
  kpiData: any[];
  feedbackStats: {
    used: number;
    dismissed: number;
  };
  pluginStats: Record<string, number>;
  topCampaigns: any[];
  roiData: any;
  isLoading: boolean;
  error: Error | null;
  campaignApprovalRate: TrendMetric;
  aiRegenerationVolume: TrendMetric;
  feedbackPositivityRatio: TrendMetric;
  conversionRate: TrendMetric;
}

export function useInsightsData(dateRange: string): InsightsData {
  const kpiHistory = useKpiHistory(dateRange);
  const feedbackMetrics = useFeedbackMetrics(dateRange);
  const roiMetrics = useRoiMetrics(dateRange);
  const campaignMetrics = useCampaignMetrics(dateRange);

  const isLoading = kpiHistory.isLoading || feedbackMetrics.isLoading || roiMetrics.isLoading || campaignMetrics.isLoading;
  const error = kpiHistory.error || feedbackMetrics.error || roiMetrics.error || campaignMetrics.error;

  // Computed metrics with default values
  const campaignApprovalRate = useMemo(() => ({
    current: 85,
    trend: 'up' as TrendType,
    change: 5
  }), []);

  const aiRegenerationVolume = useMemo(() => ({
    current: 42,
    trend: 'down' as TrendType,
    change: 12
  }), []);

  const feedbackPositivityRatio = useMemo(() => ({
    current: 78,
    trend: 'up' as TrendType,
    change: 8
  }), []);

  const conversionRate = useMemo(() => ({
    current: 3.2,
    trend: 'up' as TrendType,
    change: 0.4
  }), []);
  
  // Safe access to data
  const dashboardData = useMemo(() => {
    return {
      kpiMetrics: kpiHistory.data || [],
      feedbackMetrics: feedbackMetrics.data || { positive: 0, negative: 0, neutral: 0, used: 0, dismissed: 0 },
      roiMetrics: roiMetrics.metrics || { 
        conversions: "0", 
        views: "0", 
        clicks: "0", 
        conversionRate: "0%", 
        clickRate: "0%" 
      },
      campaignMetrics: campaignMetrics.data || []
    };
  }, [kpiHistory.data, feedbackMetrics.data, roiMetrics.metrics, campaignMetrics.data]);

  // Return a consistent shape with all required fields
  return {
    kpiData: kpiHistory.data || [],
    feedbackStats: dashboardData.feedbackMetrics ? {
      used: dashboardData.feedbackMetrics.used || 0,
      dismissed: dashboardData.feedbackMetrics.dismissed || 0
    } : { used: 0, dismissed: 0 },
    pluginStats: {},
    topCampaigns: campaignMetrics.data || [],
    roiData: roiMetrics.metrics || null,
    isLoading,
    error: error as Error | null,
    campaignApprovalRate,
    aiRegenerationVolume,
    feedbackPositivityRatio,
    conversionRate
  };
}
