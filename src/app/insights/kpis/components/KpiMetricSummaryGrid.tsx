
import React from 'react';
import { KpiMetric } from '@/types/kpi';
import KpiMetricCard from './KpiMetricCard';

interface KpiMetricSummaryGridProps {
  metrics: KpiMetric[];
}

export function KpiMetricSummaryGrid({ metrics }: KpiMetricSummaryGridProps) {
  // Group metrics by name to avoid duplicates (in case there are multiple records for the same metric)
  const uniqueMetrics = metrics.reduce<Record<string, KpiMetric>>((acc, metric) => {
    const key = metric.kpi_name || metric.metric || '';
    
    // If this metric doesn't exist in accumulator or current one is newer, use it
    if (!acc[key] || (metric.updated_at && acc[key].updated_at && new Date(metric.updated_at) > new Date(acc[key].updated_at))) {
      acc[key] = metric;
    }
    
    return acc;
  }, {});

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Object.values(uniqueMetrics).map((metric, index) => (
        <KpiMetricCard
          key={metric.id || index}
          {...metric}
        />
      ))}
    </div>
  );
}

export default KpiMetricSummaryGrid;
