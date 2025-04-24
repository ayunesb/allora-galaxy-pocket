
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useTenant } from "@/hooks/useTenant";
import { useQuery } from "@tanstack/react-query";
import type { KpiAlert } from "@/types/kpi";

interface KpiAlertsOptions {
  days?: number;
  activeOnly?: boolean;
}

export function useKpiAlerts(options?: KpiAlertsOptions) {
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const daysToFetch = options?.days || 30;
  const activeOnly = options?.activeOnly || false;
  
  const { 
    data: alerts = [], 
    refetch: refreshAlerts,
    error
  } = useQuery({
    queryKey: ['kpi-alerts', tenant?.id, daysToFetch, activeOnly],
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
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as KpiAlert[];
    },
    enabled: !!tenant?.id,
  });
  
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
      
      return true;
    } catch (err) {
      console.error("Error checking KPI alerts:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    triggerKpiCheck,
    refreshAlerts,
    alerts,
    campaignInsights,
    isLoading,
    error
  };
}
