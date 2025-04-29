
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { KPIData } from '@/components/KPITracker';

export interface KpiDataResult {
  data: KPIData[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useKpiData(): KpiDataResult {
  const { tenant } = useTenant();
  
  const query = useQuery({
    queryKey: ['kpi-metrics', tenant?.id],
    queryFn: async (): Promise<KPIData[]> => {
      if (!tenant?.id) return [];
      
      const { data: metrics, error } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenant.id);
        
      if (error) throw error;
      
      // Get historical data to calculate percent changes
      const { data: historicalData, error: historyError } = await supabase
        .from('kpi_metrics_history')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('recorded_at', { ascending: false })
        .limit(10);
        
      if (historyError) console.error('Error fetching historical data:', historyError);
      
      // Map the data into the required format
      const formattedData: KPIData[] = (metrics || []).map(metric => {
        // Find historical data for this metric to calculate percent change
        const lastRecord = historicalData?.find(h => 
          h.metric === metric.metric && 
          h.recorded_at !== metric.recorded_at
        );
        
        const percentChange = lastRecord 
          ? ((Number(metric.value) - Number(lastRecord.value)) / Number(lastRecord.value)) * 100 
          : undefined;
          
        return {
          name: metric.metric,
          value: Number(metric.value),
          target: 100, // Default target
          percentChange: percentChange ? Math.round(percentChange * 10) / 10 : undefined
        };
      });
      
      return formattedData;
    },
    enabled: !!tenant?.id,
  });
  
  return {
    data: query.data || [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
    refetch: query.refetch
  };
}
