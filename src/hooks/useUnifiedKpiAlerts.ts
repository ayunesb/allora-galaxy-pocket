
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTenant } from "@/hooks/useTenant";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { KpiAlert, KpiInsight, UnifiedAlert } from "@/types/kpi";

export interface UnifiedKpiAlert extends UnifiedAlert {}

interface UseUnifiedKpiAlertsOptions {
  days?: number;
  activeOnly?: boolean;
  severity?: string;
}

export function useUnifiedKpiAlerts(options?: UseUnifiedKpiAlertsOptions) {
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const daysToFetch = options?.days || 30;
  const activeOnly = options?.activeOnly || false;
  const severityFilter = options?.severity;
  
  // Query for kpi_alerts table
  const { 
    data: rawKpiAlerts = [], 
    refetch: refreshKpiAlerts,
    error: alertsError
  } = useQuery({
    queryKey: ['unified-kpi-alerts-source1', tenant?.id, daysToFetch, activeOnly, severityFilter],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      let query = supabase
        .from('kpi_alerts')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
        
      if (activeOnly) {
        query = query.in('status', ['pending', 'triggered']);
      }
      
      if (severityFilter) {
        query = query.eq('severity', severityFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data as KpiAlert[];
    },
    enabled: !!tenant?.id,
  });
  
  // Query for kpi_insights table
  const { 
    data: rawKpiInsights = [],
    refetch: refreshKpiInsights,
    error: insightsError
  } = useQuery({
    queryKey: ['unified-kpi-alerts-source2', tenant?.id, daysToFetch, severityFilter],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      let query = supabase
        .from('kpi_insights')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
        
      if (activeOnly) {
        query = query.neq('outcome', 'resolved');
      }
      
      if (severityFilter) {
        query = query.eq('impact_level', severityFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data as KpiInsight[];
    },
    enabled: !!tenant?.id,
  });
  
  // Transform insights into unified format
  const unifiedInsights: UnifiedAlert[] = (rawKpiInsights || []).map(insight => ({
    id: insight.id,
    kpi_name: insight.kpi_name,
    description: insight.insight,
    severity: (insight.impact_level as 'low' | 'medium' | 'high') || 'medium',
    status: insight.outcome === 'resolved' ? 'resolved' : 'pending',
    current_value: undefined,
    previous_value: undefined,
    percent_change: undefined,
    triggered_at: insight.created_at,
    created_at: insight.created_at,
    tenant_id: insight.tenant_id,
    campaign_id: insight.campaign_id,
    message: insight.suggested_action,
    source_type: 'kpi_insight' as const,
  }));
  
  // Transform alerts into unified format
  const unifiedAlerts: UnifiedAlert[] = (rawKpiAlerts || []).map(alert => ({
    ...alert,
    description: alert.description || '',
    source_type: 'kpi_alert' as const
  }));
  
  // Combine both sources
  const alerts: UnifiedAlert[] = [...unifiedAlerts, ...unifiedInsights];
  
  // Function to refresh all data
  const refreshUnifiedAlerts = async () => {
    await Promise.all([
      refreshKpiAlerts(),
      refreshKpiInsights()
    ]);
  };
  
  // Trigger KPI check functionality
  const triggerKpiCheck = async (tenantId?: string) => {
    const idToUse = tenantId || tenant?.id;
    
    if (!idToUse) {
      toast.error("No tenant ID provided");
      return false;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.functions.invoke("check-kpi-alerts", {
        body: { tenant_id: idToUse }
      });
      
      if (error) throw error;
      
      toast.success("KPI check triggered successfully");
      await refreshUnifiedAlerts();
      return true;
    } catch (err) {
      console.error("Error checking KPI alerts:", err);
      toast.error(`Error checking KPI alerts: ${(err as Error).message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Resolve an alert (works with both sources)
  const resolveAlert = async (alertId: string, resolutionNote: string, sourceType: 'kpi_alert' | 'kpi_insight') => {
    if (!tenant?.id) {
      toast.error("No tenant ID");
      return false;
    }

    try {
      setIsLoading(true);
      
      // Use the security definer function to resolve alerts
      const { data, error } = await supabase.rpc('resolve_kpi_alert', {
        alert_id: alertId,
        resolution_note: resolutionNote
      });
      
      if (error) throw error;
      
      if (data === true) {
        toast.success("Alert resolved successfully");
        await refreshUnifiedAlerts();
        return true;
      } else {
        toast.error("Failed to resolve alert");
        return false;
      }
    } catch (err) {
      console.error("Error resolving alert:", err);
      toast.error(`Error resolving alert: ${(err as Error).message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Return unified data with original sources for backward compatibility
  return {
    alerts,
    rawKpiAlerts,
    rawKpiInsights,
    isLoading,
    error: alertsError || insightsError,
    resolveAlert,
    triggerKpiCheck,
    refreshAlerts: refreshUnifiedAlerts
  };
}
