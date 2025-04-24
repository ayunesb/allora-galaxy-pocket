
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

export function useKpiData(dateRange = 30) {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ['kpi-data', tenant?.id, dateRange],
    queryFn: async () => {
      if (!tenant?.id) return null;

      // Get current KPI metrics
      const { data: metrics, error: metricsError } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('recorded_at', { ascending: false });

      if (metricsError) throw metricsError;

      // Get KPI trends from materialized view
      const { data: trends, error: trendsError } = await supabase
        .from('kpi_trends')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('day', { ascending: true });

      if (trendsError) throw trendsError;

      return {
        currentMetrics: metrics || [],
        trends: trends || []
      };
    },
    enabled: !!tenant?.id,
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
  });
}
