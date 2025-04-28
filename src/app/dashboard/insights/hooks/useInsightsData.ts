
// Fix the useInsightsData hook ROI data access

import { useMemo } from "react";
import { useKpiHistory } from "./useKpiHistory";
import { useFeedbackMetrics } from "./useFeedbackMetrics";
import { useRoiMetrics } from "./useRoiMetrics";
import { useCampaignMetrics } from "./useCampaignMetrics";

export function useInsightsData(dateRange: string) {
  const { data: kpiData, isLoading: kpiLoading, error: kpiError } = useKpiHistory(dateRange);
  const { data: feedbackData, isLoading: feedbackLoading, error: feedbackError } = useFeedbackMetrics(dateRange);
  const { metrics: roiMetrics, isLoading: roiLoading, error: roiError } = useRoiMetrics(dateRange);
  const { data: campaignData, isLoading: campaignLoading, error: campaignError } = useCampaignMetrics(dateRange);

  const isLoading = kpiLoading || feedbackLoading || roiLoading || campaignLoading;
  const error = kpiError || feedbackError || roiError || campaignError;

  const dashboardData = useMemo(() => {
    return {
      kpiMetrics: kpiData || [],
      feedbackMetrics: feedbackData || { positive: 0, negative: 0, neutral: 0 },
      // No longer access roiData directly as it might not exist
      roiMetrics: roiMetrics || { conversions: "0", views: "0", clicks: "0", conversionRate: "0%", clickRate: "0%" },
      campaignMetrics: campaignData || []
    };
  }, [kpiData, feedbackData, roiMetrics, campaignData]);

  return { dashboardData, isLoading, error };
}
