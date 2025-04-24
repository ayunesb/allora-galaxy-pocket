
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";
import { toast } from "sonner";

interface KpiMetric {
  name: string;
  value: number;
  metadata?: Record<string, any>;
}

export function useKpiTracking() {
  const { tenant } = useTenant();

  const trackMetric = useMutation({
    mutationFn: async (metric: KpiMetric) => {
      if (!tenant?.id) throw new Error("No tenant selected");

      const { error } = await supabase
        .from("kpi_metrics")
        .insert({
          tenant_id: tenant.id,
          metric: metric.name,
          value: metric.value,
          metadata: metric.metadata || {}
        });

      if (error) throw error;
    },
    onError: (error) => {
      console.error("KPI tracking failed:", error);
      toast.error("Failed to track KPI metric");
    }
  });

  const { data: latestMetrics } = useQuery({
    queryKey: ["latest-kpi-metrics", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

      const { data, error } = await supabase
        .from("kpi_metrics")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  return {
    trackMetric: trackMetric.mutate,
    latestMetrics,
    isLoading: trackMetric.isPending
  };
}
