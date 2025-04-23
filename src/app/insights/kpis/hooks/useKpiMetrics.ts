
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

      let query = supabase
        .from('kpi_metrics_view')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('updated_at', startDate.toISOString())
        .order('updated_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      if (searchQuery) {
        query = query.ilike('kpi_name', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as KpiMetric[];
    },
    enabled: !!tenant?.id
  });
}
