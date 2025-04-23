
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { subDays } from "date-fns";

export function useKpiMetrics(dateRange: string = "30") {
  const { tenant } = useTenant();
  const startDate = subDays(new Date(), parseInt(dateRange));

  return useQuery({
    queryKey: ['kpi-metrics', tenant?.id, dateRange],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('updated_at', startDate.toISOString())
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });
}
