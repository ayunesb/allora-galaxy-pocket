
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

export type TrendType = 'up' | 'down' | 'neutral';

export interface KpiTrend {
  current: number;
  trend: TrendType;
  change: number;
}

export function useKpiHistory(dateRange: string) {
  const { tenant } = useTenant();
  const formattedStartDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return useQuery({
    queryKey: ['kpi-metrics-history', tenant?.id, dateRange],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from('kpi_metrics_history')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('recorded_at', formattedStartDate)
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });
}
