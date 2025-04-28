
import { useMemo } from "react";
import { KpiMetric } from "@/types/kpi";
import { MetricsCardProps } from "@/app/admin/analytics/MetricsCard";

export function useMetricSummaries(metrics: KpiMetric[]) {
  const summaries = useMemo(() => {
    if (!metrics || metrics.length === 0) {
      return [];
    }

    // Group metrics by name to get the latest value for each
    const metricsMap = metrics.reduce((acc, metric) => {
      if (!acc[metric.kpi_name || '']) {
        acc[metric.kpi_name || ''] = metric;
      } else {
        // If we already have this metric, check if this one is newer
        const existingDate = new Date(acc[metric.kpi_name || ''].updated_at || "");
        const currentDate = new Date(metric.updated_at || "");
        
        if (currentDate > existingDate) {
          acc[metric.kpi_name || ''] = metric;
        }
      }
      
      return acc;
    }, {} as Record<string, KpiMetric>);

    // Convert to array for display
    return Object.values(metricsMap).map(metric => {
      // Format as metrics card props
      return {
        title: metric.kpi_name || metric.metric || 'Unnamed Metric',
        value: String(metric.value || '0'),
        trend: metric.trend || undefined,
        change: metric.changePercent ? `${metric.changePercent}%` : undefined,
        description: metric.description || '',
      } as MetricsCardProps;
    });
  }, [metrics]);

  return summaries;
}
