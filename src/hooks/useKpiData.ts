
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface KpiMetric {
  id: string;
  metric: string;
  value: number;
  created_at: string;
}

export interface KpiTrend {
  metric: string;
  value: number;
  day: string; 
}

export interface KpiDataResult {
  currentMetrics: KpiMetric[];
  trends: KpiTrend[];
  isLoading: boolean;
  error: Error | null;
}

export function useKpiData(): KpiDataResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['kpi-data'],
    queryFn: async () => {
      // Get current metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('kpi_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (metricsError) throw metricsError;
      
      // Get trend data (last 7 days)
      const { data: trendData, error: trendError } = await supabase
        .from('kpi_metrics')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });
      
      if (trendError) throw trendError;
      
      // Process trend data to have day labels
      const processedTrends = trendData.map(item => ({
        metric: item.metric,
        value: parseFloat(item.value),
        day: new Date(item.created_at).toLocaleDateString('en-US', { weekday: 'short' })
      }));
      
      return {
        currentMetrics: metricsData.map(m => ({
          ...m,
          value: parseFloat(m.value)
        })),
        trends: processedTrends
      };
    }
  });
  
  return {
    currentMetrics: data?.currentMetrics || [],
    trends: data?.trends || [],
    isLoading,
    error
  };
}
