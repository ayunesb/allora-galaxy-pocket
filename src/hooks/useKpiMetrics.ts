
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import type { KpiMetric } from "@/types/kpi";
import { toast } from "sonner";

export function useKpiMetrics(dateRange = "30", category?: string) {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['kpi-metrics', tenant?.id, dateRange, category],
    queryFn: async () => {
      if (!tenant?.id) throw new Error('No tenant selected');

      try {
        // Use kpi_metrics table directly instead of the view
        let query = supabase
          .from('kpi_metrics')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false });
        
        if (category && category !== 'all') {
          query = query.eq('category', category);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        return data?.map(metric => ({
          id: metric.id,
          kpi_name: metric.metric || 'Unnamed Metric',
          value: Number(metric.value) || 0,
          trend: determineMetricTrend(metric.value),
          changePercent: 0, // Default since we don't have historical data
          updated_at: metric.updated_at || metric.created_at || new Date().toISOString(),
          tenant_id: tenant.id,
          label: metric.metric || 'Unnamed Metric',
          created_at: metric.created_at
        })) as KpiMetric[] || [];
      } catch (err) {
        console.error("Error fetching KPI metrics:", err);
        throw err;
      }
    },
    enabled: !!tenant?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000
  });

  // Function to manually trigger GA4 sync
  const syncWithGA4 = async () => {
    if (!tenant?.id) {
      toast.error("No workspace selected");
      return false;
    }

    try {
      toast.loading("Syncing with GA4...");
      
      const { error } = await supabase.functions.invoke("fetch-ga4-metrics", {
        body: { tenant_id: tenant.id }
      });
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
      
      toast.success("GA4 metrics synced successfully");
      return true;
    } catch (err: any) {
      toast.error("Failed to sync GA4 metrics", {
        description: err.message || "An unknown error occurred"
      });
      return false;
    }
  };

  return {
    ...query,
    syncWithGA4
  };
}

// Helper function to determine trend based on value
function determineMetricTrend(value: number): 'up' | 'down' | 'neutral' {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'neutral';
}
