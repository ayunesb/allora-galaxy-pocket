
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { subDays } from "date-fns";

export function useKpiAlerts(severity?: string, days: number = 7) {
  const { tenant } = useTenant();
  const startDate = subDays(new Date(), days);

  return useQuery({
    queryKey: ['kpi-alerts', tenant?.id, severity, days],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      let query = supabase
        .from('kpi_insights')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (severity) {
        query = query.eq('impact_level', severity);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });
}
