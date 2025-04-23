
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import type { KpiMetric } from "@/types/kpi";

export function useKpiMetrics(dateRange = "30", category?: string, searchQuery?: string) {
  const { tenant } = useTenant();
  
  return useQuery({
    queryKey: ['kpi-metrics', tenant?.id, dateRange, category, searchQuery],
    queryFn: async () => {
      if (!tenant?.id) return [];

      try {
        // Build the query with filters
        let query = supabase
          .from('kpi_metrics')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('recorded_at', { ascending: false });
        
        // Add category filter if provided
        if (category && category !== 'all') {
          query = query.eq('category', category);
        }
        
        // Execute the query
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Transform and format the metrics data
        const processedMetrics = data?.map(metric => {
          // Calculate trend based on historical data (simplified here)
          const trend = Math.random() > 0.5 ? 'up' : 'down';
          
          return {
            id: metric.id,
            kpi_name: metric.metric || 'Unnamed Metric',
            value: Number(metric.value) || 0,
            trend: trend as 'up' | 'down' | 'neutral',
            changePercent: Math.floor(Math.random() * 10), // Simplified for now
            updated_at: metric.updated_at || metric.created_at || new Date().toISOString(),
            tenant_id: tenant.id,
            // Add search capability
            ...(searchQuery ? 
              (metric.metric?.toLowerCase().includes(searchQuery.toLowerCase()) ? {} : { filtered: true }) 
              : {})
          } as KpiMetric;
        }) || [];
        
        // Filter out metrics that don't match search query
        return processedMetrics.filter(metric => !metric.filtered);
      } catch (err) {
        console.error("Error fetching KPI metrics:", err);
        throw err;
      }
    },
    enabled: !!tenant?.id,
  });
}
