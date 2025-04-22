
import { useMemo } from "react";
import type { KpiAlert } from "@/types/kpi";
import type { MetricSummary } from "../components/KpiMetricSummaryGrid";

interface KpiMetricFromDB {
  id: string;
  metric: string;
  value: number;
  recorded_at: string;
  tenant_id?: string;
}

export function useMetricSummaries(
  metrics: KpiMetricFromDB[], 
  alerts: KpiAlert[]
): MetricSummary[] {
  return useMemo(() => {
    try {
      // Check if metrics exist
      if (!metrics || metrics.length === 0) {
        console.log("No metrics data available");
        return [];
      }
      
      // Group metrics by type
      const metricsByType = metrics.reduce((acc, metric) => {
        const metricName = metric.metric || "unknown";
        if (!acc[metricName]) {
          acc[metricName] = [];
        }
        acc[metricName].push(metric);
        return acc;
      }, {} as Record<string, KpiMetricFromDB[]>);

      // Process each metric group into summary data
      return Object.entries(metricsByType).map(([metricName, values]) => {
        try {
          const sortedValues = [...values].sort((a, b) => 
            new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
          );
          
          // Safely handle potential undefined or null values with explicit type checks
          const current = typeof sortedValues[sortedValues.length - 1]?.value === 'number' 
            ? sortedValues[sortedValues.length - 1].value 
            : 0;
            
          const previous = typeof sortedValues[0]?.value === 'number'
            ? sortedValues[0].value 
            : 0;
          
          const change = previous === 0 ? 0 : ((current - previous) / previous) * 100;
          
          // Explicitly type the trend value
          const trend: "up" | "down" | "neutral" = 
            change > 0 ? "up" : change < 0 ? "down" : "neutral";
          
          const metricAlerts = alerts.filter(alert => alert.metric === metricName);
          
          // Ensure value is always converted to string safely
          const valueString = typeof current === 'number' ? current.toString() : '0';
          
          return {
            title: metricName,
            value: valueString,
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
    } catch (error) {
      console.error("Fatal error in useMetricSummaries:", error);
      return [];
    }
  }, [metrics, alerts]);
}
