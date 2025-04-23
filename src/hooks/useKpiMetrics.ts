
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import type { KpiMetric } from "@/types/kpi";

export function useKpiMetrics(dateRange = "30") {
  const { tenant } = useTenant();
  
  return useQuery({
    queryKey: ['kpi-metrics-processed', tenant?.id, dateRange],
    queryFn: async () => {
      if (!tenant?.id) return [];

      try {
        // Fetch current KPI data
        const { data: currentData, error: currentError } = await supabase
          .from('kpi_metrics')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('recorded_at', { ascending: false });
        
        if (currentError) throw currentError;
        
        // Fetch historical data from kpi_metrics_history
        const { data: historyData, error: historyError } = await supabase
          .from('kpi_metrics_history')
          .select('*')
          .eq('tenant_id', tenant.id);
          
        if (historyError) throw historyError;
        
        // Group by metric name
        const metricGroups: Record<string, any[]> = {};
        
        // Process current metrics first
        if (Array.isArray(currentData)) {
          currentData.forEach(item => {
            if (!metricGroups[item.metric]) {
              metricGroups[item.metric] = [];
            }
            metricGroups[item.metric].push(item);
          });
        }
        
        // Add historical data to the same groups
        if (Array.isArray(historyData)) {
          historyData.forEach(item => {
            if (!metricGroups[item.metric]) {
              metricGroups[item.metric] = [];
            }
            metricGroups[item.metric].push(item);
          });
        }
        
        // Process each metric group to calculate trends and prepare final data
        const processedData = Object.entries(metricGroups).map(([metricName, values]) => {
          // Sort by recorded_at descending to get latest first
          const sortedValues = [...values].sort((a, b) => 
            new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
          );
          
          if (sortedValues.length === 0) return null;
          
          const latestValue = sortedValues[0];
          const previousValue = sortedValues.length > 1 ? sortedValues[1] : null;
          
          // Calculate trend and change percentage
          let trend: "up" | "down" | "neutral" = "neutral";
          let changePercent = 0;
          
          if (previousValue) {
            if (latestValue.value > previousValue.value) {
              trend = "up";
            } else if (latestValue.value < previousValue.value) {
              trend = "down";
            }
            
            if (previousValue.value !== 0) {
              changePercent = Number(
                (((latestValue.value - previousValue.value) / Math.abs(previousValue.value)) * 100).toFixed(1)
              );
            }
          }
          
          // Create historical data for charts
          const historicalData = sortedValues.map(item => ({
            value: Number(item.value),
            recorded_at: item.recorded_at
          }));
          
          return {
            label: metricName,
            value: latestValue.value,
            trend,
            changePercent,
            historicalData
          };
        }).filter(Boolean) as KpiMetric[];
        
        return processedData;
      } catch (err) {
        console.error("Error fetching KPI metrics:", err);
        throw err;
      }
    },
    enabled: !!tenant?.id,
  });
}
