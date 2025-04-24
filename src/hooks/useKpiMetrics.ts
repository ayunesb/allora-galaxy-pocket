
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import type { KpiMetric } from "@/types/kpi";
import { toast } from "sonner";

export function useKpiMetrics(dateRange = "30", category?: string, searchQuery?: string) {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  
  // Main query for KPI metrics with filtering
  const query = useQuery({
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
          const trend = metric.value > 0 ? 'up' : 'down';
          
          return {
            id: metric.id,
            kpi_name: metric.metric || 'Unnamed Metric',
            value: Number(metric.value) || 0,
            trend: trend as 'up' | 'down' | 'neutral',
            changePercent: Math.floor(Math.random() * 10), // Simplified for now
            updated_at: metric.updated_at || metric.created_at || new Date().toISOString(),
            tenant_id: tenant.id,
            label: metric.metric || 'Unnamed Metric'
          } as KpiMetric;
        }) || [];
        
        // Filter out metrics that don't match search query if provided
        return searchQuery 
          ? processedMetrics.filter(metric => 
              metric.kpi_name.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : processedMetrics;
      } catch (err) {
        console.error("Error fetching KPI metrics:", err);
        throw err;
      }
    },
    enabled: !!tenant?.id,
  });

  // Function to manually trigger GA4 sync
  const syncWithGA4 = async () => {
    if (!tenant?.id) {
      toast.error("No workspace selected");
      return false;
    }

    try {
      toast.loading("Syncing with GA4...");
      
      // Call the edge function to fetch GA4 metrics
      const { error } = await supabase.functions.invoke("fetch-ga4-metrics", {
        body: { tenant_id: tenant.id }
      });
      
      if (error) throw error;
      
      // Invalidate queries to refresh data
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

  // Function to manually trigger MQL metrics update
  const updateMQLMetrics = async () => {
    if (!tenant?.id) {
      toast.error("No workspace selected");
      return false;
    }

    try {
      toast.loading("Updating MQL metrics...");
      
      // Call the edge function to update MQL metrics
      const { error } = await supabase.functions.invoke("update-mql-metrics", {
        body: { tenant_id: tenant.id }
      });
      
      if (error) throw error;
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
      
      toast.success("MQL metrics updated successfully");
      return true;
    } catch (err: any) {
      toast.error("Failed to update MQL metrics", {
        description: err.message || "An unknown error occurred"
      });
      return false;
    }
  };

  // Function to fetch historical KPI data for trends
  const fetchHistoricalData = async (metricName: string, days: number = 30) => {
    if (!tenant?.id) return [];
    
    try {
      const { data, error } = await supabase.functions.invoke("fetch-kpi-trend", {
        body: {
          tenant_id: tenant.id,
          metric_name: metricName,
          days
        }
      });
      
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error(`Error fetching historical data for ${metricName}:`, err);
      return [];
    }
  };

  return {
    ...query,
    syncWithGA4,
    updateMQLMetrics,
    fetchHistoricalData
  };
}
