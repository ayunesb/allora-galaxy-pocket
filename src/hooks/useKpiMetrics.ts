
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";
import type { KpiMetric } from "@/types/kpi";

export function useKpiMetrics() {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ["kpi-metrics", tenant?.id],
    queryFn: async (): Promise<KpiMetric[]> => {
      const { data, error } = await supabase
        .from("kpi_metrics")
        .select("*")
        .eq("tenant_id", tenant?.id);

      if (error) throw error;
      
      return data.map(metric => ({
        label: metric.metric,
        value: metric.value,
        trend: metric.value > 0 ? "up" : "down",
        changePercent: 0 // We'll implement historical comparison later
      }));
    },
    enabled: !!tenant?.id
  });
}
