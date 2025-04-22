
import { useMemo } from "react";
import type { KpiMetric, KpiAlert } from "@/types/kpi";
import type { MetricSummary } from "../components/KpiMetricSummaryGrid";

export function useMetricSummaries(
  metrics: KpiMetric[], 
  alerts: KpiAlert[]
): MetricSummary[] {
  return useMemo(() => {
    // Group metrics by type
    const metricsByType = metrics.reduce((acc, metric) => {
      if (!acc[metric.metric]) {
        acc[metric.metric] = [];
      }
      acc[metric.metric].push(metric);
      return acc;
    }, {} as Record<string, KpiMetric[]>);

    // Process each metric group into summary data
    return Object.entries(metricsByType).map(([metricName, values]) => {
      try {
        const sortedValues = [...values].sort((a, b) => 
          new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
        );
        
        const current = sortedValues[sortedValues.length - 1]?.value || 0;
        const previous = sortedValues[0]?.value || 0;
        
        const change = previous === 0 ? 0 : ((current - previous) / previous) * 100;
        
        // Explicitly type the trend value
        const trend: "up" | "down" | "neutral" = 
          change > 0 ? "up" : change < 0 ? "down" : "neutral";
        
        const metricAlerts = alerts.filter(alert => alert.metric === metricName);
        
        return {
          title: metricName,
          value: current.toFixed(1),
          trend,
          change: Math.abs(change).toFixed(1),
          alerts: metricAlerts
        };
      } catch (err) {
        console.error(`Error processing metric ${metricName}:`, err);
        return {
          title: metricName,
          value: "Error",
          trend: "neutral" as const,
          change: "0",
          alerts: []
        };
      }
    });
  }, [metrics, alerts]);
}
