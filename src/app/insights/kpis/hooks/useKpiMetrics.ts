
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
        .order('updated_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (searchQuery) {
        query = query.ilike('metric', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Map database fields to match component expectations
      return (data as any[]).map(kpi => {
        // Get historical data for comparison if available
        const historyQuery = supabase
          .from('kpi_metrics_history')
          .select('*')
          .eq('metric', kpi.metric)
          .eq('tenant_id', tenant.id)
          .order('recorded_at', { ascending: false })
          .limit(1);
          
        // Process each KPI metric
        return {
          ...kpi,
          kpi_name: kpi.metric,
          label: kpi.metric, // Add label for UI components
          trend: 'neutral', // Default trend
          changePercent: 0, // Default change percentage
          last_value: null // Will be populated from history
        } as KpiMetric;
      });
    },
    enabled: !!tenant?.id
  });
}
