
import { useMemo } from "react";
import { useKpiHistory } from "./useKpiHistory";
import { useFeedbackMetrics } from "./useFeedbackMetrics";
import { useRoiMetrics } from "./useRoiMetrics";
import { useCampaignMetrics } from "./useCampaignMetrics";
import { Campaign } from "@/types/campaign";

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
  // Get data from various hooks
  const kpiHistory = useKpiHistory(dateRange);
  const feedbackMetrics = useFeedbackMetrics(dateRange);
  const roiMetrics = useRoiMetrics();
  const campaignMetrics = useCampaignMetrics(dateRange);

  // Determine loading and error states
  const isLoading = kpiHistory.isLoading || 
    false /* feedbackMetrics doesn't expose isLoading */ || 
    roiMetrics.isLoading || 
    false /* campaignMetrics doesn't expose isLoading */;
    
  const error = kpiHistory.error || 
    null /* feedbackMetrics doesn't expose error */ || 
    roiMetrics.error || 
    null /* campaignMetrics doesn't expose error */;

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
      feedbackMetrics: {
        positive: 0,
        negative: 0,
        neutral: 0,
        ...feedbackMetrics.feedbackStats
      },
      roiMetrics: roiMetrics.metrics || { 
        conversions: "0", 
        views: "0", 
        clicks: "0", 
        conversionRate: "0%", 
        clickRate: "0%" 
      },
      campaignMetrics: campaignMetrics.topCampaigns || []
    };
  }, [kpiHistory.data, feedbackMetrics.feedbackStats, roiMetrics.metrics, campaignMetrics.topCampaigns]);

  // Return a consistent shape with all required fields
  return {
    kpiData: kpiHistory.data || [],
    feedbackStats: feedbackMetrics.feedbackStats || { used: 0, dismissed: 0 },
    pluginStats: {},
    topCampaigns: campaignMetrics.topCampaigns || [],
    roiData: roiMetrics.metrics || null,
    isLoading,
    error: error as Error | null,
    campaignApprovalRate,
    aiRegenerationVolume,
    feedbackPositivityRatio,
    conversionRate
  };
}
