
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useTenant } from "@/hooks/useTenant";
import { useQuery } from "@tanstack/react-query";
import type { KpiAlert, KpiInsight } from "@/types/kpi";

interface KpiAlertsOptions {
  days?: number;
  activeOnly?: boolean;
  severity?: string;
}

export function useKpiAlerts(options?: KpiAlertsOptions) {
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const daysToFetch = options?.days || 30;
  const activeOnly = options?.activeOnly || false;
  const severityFilter = options?.severity;
  
  // Primary query for kpi_alerts table
  const { 
    data: kpiAlerts = [], 
    refetch: refreshKpiAlerts,
    error: alertsError
  } = useQuery({
    queryKey: ['kpi-alerts', tenant?.id, daysToFetch, activeOnly, severityFilter],
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
  
  // Secondary query for kpi_insights table to provide backward compatibility
  const { data: kpiInsights = [] } = useQuery({
    queryKey: ['kpi-insights', tenant?.id, daysToFetch, severityFilter],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      let query = supabase
        .from('kpi_insights')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
        
      if (severityFilter) {
        query = query.eq('impact_level', severityFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform insights into a compatible format with KpiAlert for unified use
      return (data || []).map(insight => ({
        id: insight.id,
        kpi_name: insight.kpi_name,
        description: insight.insight,
        severity: insight.impact_level || 'medium',
        current_value: 0, // Default values since insights don't have these
        status: 'pending',
        triggered_at: insight.created_at,
        created_at: insight.created_at,
        tenant_id: insight.tenant_id,
        campaign_id: insight.campaign_id,
        message: insight.suggested_action,
      })) as KpiAlert[];
    },
    enabled: !!tenant?.id,
  });
  
  // Campaign insights (kept for backward compatibility)
  const { data: campaignInsights = [] } = useQuery({
    queryKey: ['campaign-insights', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('campaign_insights')
        .select('*, campaigns(id, name, status)')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
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
      await refreshKpiAlerts();
      return true;
    } catch (err) {
      console.error("Error checking KPI alerts:", err);
      toast.error(`Error checking KPI alerts: ${(err as Error).message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Combine both alerts and insights for a unified interface
  const combinedAlerts = [...kpiAlerts, ...kpiInsights];
  
  // Remove duplicates if the same alert is in both sources by id
  const uniqueAlerts = combinedAlerts.reduce((acc, current) => {
    const x = acc.find(item => item.id === current.id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, [] as KpiAlert[]);
  
  return {
    triggerKpiCheck,
    refreshAlerts: refreshKpiAlerts,
    alerts: uniqueAlerts,
    kpiAlerts,  // Original alerts from kpi_alerts table
    kpiInsights, // Transformed alerts from kpi_insights table
    campaignInsights,
    isLoading,
    error: alertsError
  };
}
