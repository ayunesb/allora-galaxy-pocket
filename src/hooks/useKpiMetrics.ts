
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";
import type { KpiMetric } from "@/types/kpi";

// Helper to calculate week-over-week change
function calculateWeekOverWeekChange(current: number, previousWeek: number): number {
  if (previousWeek === 0) return 0;
  return ((current - previousWeek) / previousWeek) * 100;
}

// Helper to determine trend based on historical data
function calculateTrend(current: number, previousWeek: number): "up" | "down" {
  return current >= previousWeek ? "up" : "down";
}

export function useKpiMetrics() {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ["kpi-metrics", tenant?.id],
    queryFn: async (): Promise<KpiMetric[]> => {
      if (!tenant?.id) return [];
      
      // Fetch current metrics
      const { data: currentData, error: currentError } = await supabase
        .from("kpi_metrics")
        .select("*")
        .eq("tenant_id", tenant?.id);

      if (currentError) throw currentError;

      // Fetch historical data for the past 2 weeks
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const { data: historyData, error: historyError } = await supabase
        .from("kpi_metrics_history")
        .select("*")
        .eq("tenant_id", tenant?.id)
        .gte("recorded_at", twoWeeksAgo.toISOString())
        .order("recorded_at", { ascending: false });

      if (historyError) throw historyError;

      return currentData.map(metric => {
        // Get historical data for this metric
        const metricHistory = historyData
          .filter(h => h.metric === metric.metric)
          .map(h => ({
            value: Number(h.value),
            recorded_at: h.recorded_at
          }));

        // Calculate week-over-week change
        const currentValue = Number(metric.value);
        const lastWeekValue = metricHistory[0]?.value ?? currentValue;
        const changePercent = calculateWeekOverWeekChange(currentValue, lastWeekValue);

        return {
          label: metric.metric,
          value: metric.value,
          trend: calculateTrend(currentValue, lastWeekValue),
          changePercent: Math.round(changePercent * 10) / 10,
          historicalData: metricHistory
        };
      });
    },
    enabled: !!tenant?.id
  });
}
