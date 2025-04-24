
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
        // Use the new materialized view for better performance
        const { data: summaryData, error: summaryError } = await supabase
          .from('kpi_metrics_summary')
          .select('*')
          .eq('tenant_id', tenant.id);
        
        if (summaryError) throw summaryError;
        
        // Get detailed metrics if needed
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
          trend: (metric.value > 0 ? "up" : "down") as "up" | "down",
          changePercent: calculateChangePercent(metric.value, summaryData),
          updated_at: metric.updated_at || metric.created_at || new Date().toISOString(),
          tenant_id: tenant.id,
          label: metric.metric || 'Unnamed Metric'
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

// Helper function to calculate change percent
function calculateChangePercent(currentValue: number, summaryData: any[]) {
  if (!summaryData?.length) return 0;
  const avgValue = summaryData[0]?.avg_value || 0;
  if (avgValue === 0) return 0;
  return Math.round(((currentValue - avgValue) / avgValue) * 100);
}
