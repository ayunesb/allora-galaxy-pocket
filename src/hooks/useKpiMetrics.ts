
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { KpiMetric } from "@/types/kpi";
import { subDays } from "date-fns";

interface UseKpiMetricsOptions {
  dateRange?: number | string;
  category?: string;
  searchQuery?: string;
}

export function useKpiMetrics(options: UseKpiMetricsOptions = {}) {
  const { tenant } = useTenant();
  const { dateRange = 30, category, searchQuery } = options;
  
  const daysNumber = typeof dateRange === 'string' ? parseInt(dateRange) : dateRange;
  const startDate = subDays(new Date(), daysNumber);

  return useQuery({
    queryKey: ['kpi-metrics', tenant?.id, daysNumber, category, searchQuery],
    queryFn: async () => {
      if (!tenant?.id) return [];

      // Query the kpi_metrics table
      let query = supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('updated_at', startDate.toISOString())
        .order('updated_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (searchQuery) {
        query = query.ilike('metric', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Break the deep recursion by using unknown first
      const safeData = data as unknown;
      
      // Transform the data to match the KpiMetric interface using proper type handling
      const kpiMetrics = ((safeData as any[]) || []).map(metric => {
        return {
          id: metric.id,
          tenant_id: metric.tenant_id,
          kpi_name: metric.metric || '',
          metric: metric.metric || '',
          label: metric.metric || '', // Add label for compatibility
          value: Number(metric.value),
          trend: determineTrend(Number(metric.value)),
          changePercent: 0, // Would ideally be calculated by comparing to historical data
          created_at: metric.created_at,
          updated_at: metric.updated_at,
          recorded_at: metric.recorded_at,
          description: '' // Add empty description for compatibility
        };
      });
      
      return kpiMetrics as KpiMetric[];
    },
    enabled: !!tenant?.id
  });
}

// Helper function to determine the trend based on the value
function determineTrend(value: number): 'up' | 'down' | 'neutral' {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'neutral';
}
