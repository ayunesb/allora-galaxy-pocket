
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { KpiMetric } from "@/types/kpi";

interface KpiTrendPoint {
  metric: string;
  value: number;
  date: string;
  day: string;
}

interface KpiDataResult {
  currentMetrics: KpiMetric[];
  trends: KpiTrendPoint[];
  isLoading: boolean;
  error: Error | null;
}

export function useKpiData(timeFrame = 30): KpiDataResult {
  const { tenant } = useTenant();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['kpi-data', tenant?.id, timeFrame],
    queryFn: async () => {
      if (!tenant?.id) return { metrics: [], trends: [] };
      
      // Get the latest metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('updated_at', { ascending: false });
        
      if (metricsError) throw metricsError;
      
      // Get historical data for trends
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeFrame);
      
      const { data: historyData, error: historyError } = await supabase
        .from('kpi_metrics_history')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: true });
        
      if (historyError) throw historyError;
      
      // Group metrics by name to get most recent values
      const metricsByName: Record<string, KpiMetric> = {};
      
      for (const metric of metricsData || []) {
        const metricName = metric.metric;
        if (!metricsByName[metricName] || new Date(metric.updated_at) > new Date(metricsByName[metricName].updated_at || '')) {
          metricsByName[metricName] = {
            id: metric.id,
            tenant_id: metric.tenant_id,
            kpi_name: metric.metric,
            metric: metric.metric,
            value: Number(metric.value),
            trend: 'neutral',
            created_at: metric.created_at,
            updated_at: metric.updated_at,
            recorded_at: metric.recorded_at
          };
        }
      }
      
      // Process historical data for trends
      const trendPoints: KpiTrendPoint[] = (historyData || []).map(point => ({
        metric: point.metric,
        value: Number(point.value),
        date: new Date(point.recorded_at).toISOString(),
        day: new Date(point.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      }));
      
      // Add current metrics to trend data for complete view
      Object.values(metricsByName).forEach(metric => {
        if (metric.updated_at) {
          trendPoints.push({
            metric: metric.kpi_name || '',
            value: Number(metric.value),
            date: new Date(metric.updated_at).toISOString(),
            day: new Date(metric.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          });
        }
      });
      
      // Calculate trends based on historical vs current
      Object.values(metricsByName).forEach(metric => {
        const metricHistory = trendPoints.filter(t => t.metric === metric.kpi_name)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
        if (metricHistory.length >= 2) {
          const oldestValue = metricHistory[0].value;
          const currentValue = Number(metric.value);
          
          if (currentValue > oldestValue) {
            metricsByName[metric.kpi_name || ''].trend = 'up';
            metricsByName[metric.kpi_name || ''].changePercent = oldestValue !== 0 ? 
              ((currentValue - oldestValue) / Math.abs(oldestValue)) * 100 : 100;
          } else if (currentValue < oldestValue) {
            metricsByName[metric.kpi_name || ''].trend = 'down';
            metricsByName[metric.kpi_name || ''].changePercent = oldestValue !== 0 ? 
              ((currentValue - oldestValue) / Math.abs(oldestValue)) * 100 : -100;
          }
        }
      });
      
      return { 
        metrics: Object.values(metricsByName),
        trends: trendPoints
      };
    },
    enabled: !!tenant?.id,
  });
  
  return {
    currentMetrics: data?.metrics || [],
    trends: data?.trends || [],
    isLoading,
    error: error as Error | null
  };
}
