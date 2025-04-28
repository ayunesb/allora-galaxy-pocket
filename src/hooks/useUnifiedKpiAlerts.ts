
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useTenant } from "@/hooks/useTenant";
import { useQuery } from "@tanstack/react-query";
import type { KpiAlert, KpiInsight } from "@/types/kpi";

export interface UnifiedKpiAlert {
  id: string;
  kpi_name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'resolved' | 'triggered';
  created_at: string;
  triggered_at?: string;
  message?: string;
  current_value?: number;
  previous_value?: number;
  percent_change?: number;
  campaign_id?: string;
  tenant_id: string;
  source_type: 'kpi_alert' | 'kpi_insight';
  threshold?: number;
  condition?: string;
}

interface UseUnifiedKpiAlertsOptions {
  days?: number;
  activeOnly?: boolean;
  severity?: string;
}

export function useUnifiedKpiAlerts(options?: UseUnifiedKpiAlertsOptions) {
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const daysToFetch = options?.days || 30;
  const activeOnly = options?.activeOnly || false;
  const severityFilter = options?.severity;
  
  // Query for kpi_alerts table
  const { 
    data: kpiAlerts = [], 
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
      
      // Transform to unified format
      return (data || []).map(item => ({
        ...item,
        description: item.description || '',
        source_type: 'kpi_alert' as const
      })) as UnifiedKpiAlert[];
    },
    enabled: !!tenant?.id,
  });
  
  // Query for kpi_insights table
  const { 
    data: kpiInsights = [],
    refetch: refreshKpiInsights
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
      
      // Transform insights into unified format
      return (data || []).map(insight => ({
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
      })) as UnifiedKpiAlert[];
    },
    enabled: !!tenant?.id,
  });
  
  // Trigger KPI check functionality
  const triggerKpiCheck = async (tenantId?: string) => {
    const idToUse = tenantId || tenant?.id;
    
    if (!idToUse) {
      toast.error("No tenant ID provided");
      return false;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.functions.invoke("kpi-alerts", {
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
      
      if (sourceType === 'kpi_alert') {
        const { error } = await supabase
          .from('kpi_alerts')
          .update({ 
            status: 'resolved',
            message: resolutionNote
          })
          .eq('id', alertId)
          .eq('tenant_id', tenant.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('kpi_insights')
          .update({ 
            outcome: 'resolved',
            suggested_action: resolutionNote
          })
          .eq('id', alertId)
          .eq('tenant_id', tenant.id);
          
        if (error) throw error;
      }
      
      toast.success("Alert resolved successfully");
      await refreshUnifiedAlerts();
      return true;
    } catch (err) {
      console.error("Error resolving alert:", err);
      toast.error(`Error resolving alert: ${(err as Error).message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh all data sources
  const refreshUnifiedAlerts = async () => {
    await Promise.all([refreshKpiAlerts(), refreshKpiInsights()]);
  };
  
  // Combine both data sources
  const unifiedAlerts: UnifiedKpiAlert[] = [...kpiAlerts, ...kpiInsights];
  
  // Remove any duplicates by ID
  const uniqueAlerts = unifiedAlerts.reduce((acc, current) => {
    const exists = acc.find(item => item.id === current.id);
    if (!exists) {
      return [...acc, current];
    }
    return acc;
  }, [] as UnifiedKpiAlert[]);
  
  // Sort by created date
  const sortedAlerts = uniqueAlerts.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  return {
    alerts: sortedAlerts,
    rawKpiAlerts: kpiAlerts,
    rawKpiInsights: kpiInsights,
    isLoading,
    error: alertsError,
    triggerKpiCheck,
    resolveAlert,
    refreshAlerts: refreshUnifiedAlerts
  };
}
