
import { useMemo } from 'react';
import type { KpiMetric, KpiAlert } from '@/types/kpi';

export function useMetricSummaries(
  metrics: any[], 
  alerts: KpiAlert[] = []
) {
  return useMemo(() => {
    if (!metrics?.length) return [];
    
    return metrics.map(metric => {
      // Check if there are any alerts for this metric
      const hasAlert = alerts.some(
        alert => alert.kpi_name === metric.metric && alert.outcome !== 'resolved'
      );
      
      return {
        label: metric.metric,
        value: metric.value,
        trend: metric.trend || 'neutral',
        changePercent: metric.change_percent,
        hasAlert
      };
    });
  }, [metrics, alerts]);
}
