
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { KpiMetric } from "@/types/kpi";
import { subDays } from "date-fns";

export function useKpiMetrics(dateRange = "30", category?: string, searchQuery?: string) {
  const { tenant } = useTenant();
  const startDate = subDays(new Date(), parseInt(dateRange));

  return useQuery({
    queryKey: ['kpi-metrics', tenant?.id, dateRange, category, searchQuery],
    queryFn: async () => {
      if (!tenant?.id) return [];

      // Using kpi_metrics directly since we now have the view set up in the database
      let query = supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('updated_at', startDate.toISOString())
        .order('updated_at', { ascending: false }) as any;

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (searchQuery) {
        query = query.ilike('metric', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Map database fields to match component expectations
      return (data as any[]).map((kpi: any) => {
        return {
          id: kpi.id || '',
          kpi_name: kpi.metric || 'Unnamed Metric',
          value: Number(kpi.value) || 0,
          trend: determineMetricTrend(Number(kpi.value)),
          changePercent: 0, // Default since we don't have historical data
          updated_at: kpi.updated_at || kpi.created_at || new Date().toISOString(),
          tenant_id: tenant.id,
          label: kpi.metric || 'Unnamed Metric',
          created_at: kpi.created_at
        } as KpiMetric;
      });
    },
    enabled: !!tenant?.id
  });
}

// Helper function to determine trend based on value
function determineMetricTrend(value: number): 'up' | 'down' | 'neutral' {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'neutral';
}
