
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import type { KpiMetric } from "@/types/kpi";

export function useKpiMetrics() {
  const { tenant } = useTenant();
  
  return useQuery({
    queryKey: ['kpi-metrics-processed', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

      try {
        const { data, error } = await supabase
          .from('kpi_metrics')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('recorded_at', { ascending: false });
          
        if (error) throw error;
        
        // Group by metric name
        const groupedByMetric: Record<string, any[]> = {};
        
        // First ensure data is an array before trying to iterate
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            if (!groupedByMetric[item.metric]) {
              groupedByMetric[item.metric] = [];
            }
            groupedByMetric[item.metric].push(item);
          });
        }
        
        // Process each metric group
        const processedData = Object.entries(groupedByMetric).map(([metricName, values]) => {
          // Sort by recorded_at
          const sortedValues = [...values].sort(
            (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
          );
          
          // Calculate trend
          const latestValue = sortedValues[sortedValues.length - 1]?.value || 0;
          const previousValue = sortedValues.length > 1 ? sortedValues[sortedValues.length - 2]?.value : latestValue;
          const changePercent = previousValue === 0 ? 0 : ((latestValue - previousValue) / previousValue) * 100;
          
          // Explicitly type the trend as one of the allowed values
          const trend: "up" | "down" | "neutral" = 
            changePercent > 0 ? "up" : changePercent < 0 ? "down" : "neutral";
          
          // Create historical data for charts
          const historicalData = sortedValues.map(item => ({
            value: Number(item.value),
            recorded_at: item.recorded_at
          }));
          
          return {
            label: metricName,
            value: latestValue,
            trend,
            changePercent: Number(changePercent.toFixed(1)),
            historicalData
          };
        });
        
        return processedData as KpiMetric[];
      } catch (err) {
        console.error("Error fetching KPI metrics:", err);
        throw err;
      }
    },
    enabled: !!tenant?.id,
  });
}
