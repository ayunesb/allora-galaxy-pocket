import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import type { KpiMetric } from "@/types/kpi";
import { toast } from "sonner";
import React from "react";

export function useKpiMetrics(dateRange = "30", category?: string, searchQuery?: string) {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  
  // Main query for KPI metrics with filtering
  const query = useQuery({
    queryKey: ['kpi-metrics', tenant?.id, dateRange, category, searchQuery],
    queryFn: async () => {
      if (!tenant?.id) return [];

      try {
        // Use the new materialized view for better performance
        const { data: summaryData } = await supabase
          .from('kpi_metrics_summary')
          .select('*')
          .eq('tenant_id', tenant.id);
        
        // Get detailed metrics if needed
        let query = supabase
          .from('kpi_metrics')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('recorded_at', { ascending: false });
        
        if (category && category !== 'all') {
          query = query.eq('category', category);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Process and return the metrics
        return data?.map(metric => ({
          id: metric.id,
          kpi_name: metric.metric || 'Unnamed Metric',
          value: Number(metric.value) || 0,
          trend: metric.value > 0 ? 'up' : 'down',
          changePercent: calculateChangePercent(metric.value, summaryData),
          updated_at: metric.updated_at || metric.created_at || new Date().toISOString(),
          tenant_id: tenant.id,
          label: metric.metric || 'Unnamed Metric'
        })) || [];
      } catch (err) {
        console.error("Error fetching KPI metrics:", err);
        throw err;
      }
    },
    enabled: !!tenant?.id,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
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

  // Add prefetching for other date ranges
  React.useEffect(() => {
    if (tenant?.id) {
      const otherRanges = ['7', '14', '90'];
      otherRanges.forEach(range => {
        if (range !== dateRange) {
          queryClient.prefetchQuery({
            queryKey: ['kpi-metrics', tenant.id, range, category, searchQuery],
            queryFn: () => fetchKPIMetrics(tenant.id, range, category)
          });
        }
      });
    }
  }, [tenant?.id, dateRange, category, searchQuery, queryClient]);

  return {
    ...query,
    syncWithGA4,
    updateMQLMetrics,
    fetchHistoricalData
  };
}

// Helper function to calculate change percent
function calculateChangePercent(currentValue: number, summaryData: any[]) {
  if (!summaryData?.length) return 0;
  const avgValue = summaryData[0]?.avg_value || 0;
  if (avgValue === 0) return 0;
  return Math.round(((currentValue - avgValue) / avgValue) * 100);
}

async function fetchKPIMetrics(tenantId: string, range: string, category?: string) {
  // Implementation of the fetch logic for prefetching
  // ... similar to the main queryFn logic
  try {
    // Use the new materialized view for better performance
    const { data: summaryData } = await supabase
      .from('kpi_metrics_summary')
      .select('*')
      .eq('tenant_id', tenantId);
    
    // Get detailed metrics if needed
    let query = supabase
      .from('kpi_metrics')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('recorded_at', { ascending: false });
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Process and return the metrics
    return data?.map(metric => ({
      id: metric.id,
      kpi_name: metric.metric || 'Unnamed Metric',
      value: Number(metric.value) || 0,
      trend: metric.value > 0 ? 'up' : 'down',
      changePercent: calculateChangePercent(metric.value, summaryData),
      updated_at: metric.updated_at || metric.created_at || new Date().toISOString(),
      tenant_id: tenantId,
      label: metric.metric || 'Unnamed Metric'
    })) || [];
  } catch (err) {
    console.error("Error fetching KPI metrics:", err);
    throw err;
  }
}
