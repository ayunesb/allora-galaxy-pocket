
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import type { TrendType } from "./useKpiHistory";

export function useRoiMetrics(dateRange: string) {
  const { tenant } = useTenant();
  const [roiData, setRoiData] = useState<{
    current: number;
    trend: TrendType;
    change: number;
    history?: Array<{ date: string; value: number }>;
  } | null>(null);

  const { data: kpiData } = useQuery({
    queryKey: ['kpi-metrics-insights', tenant?.id, dateRange],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenant.id);

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  useEffect(() => {
    if (!tenant?.id || !kpiData) return;

    const revenueMetric = kpiData?.find(m => m.metric.toLowerCase() === 'revenue');
    const costMetric = kpiData?.find(m => m.metric.toLowerCase() === 'cost_spent');
    
    if (revenueMetric && costMetric && parseFloat(costMetric.value) > 0) {
      const revenue = parseFloat(revenueMetric.value);
      const cost = parseFloat(costMetric.value);
      const currentRoi = (revenue - cost) / cost;
      
      setRoiData({
        current: currentRoi,
        trend: 'neutral',
        change: 0,
        history: []
      });
    }
  }, [tenant?.id, kpiData]);

  return { roiData, kpiData };
}
