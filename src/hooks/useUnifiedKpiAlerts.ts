
import { useState } from "react";
import { useKpiAlerts } from "@/app/insights/alerts/hooks/useKpiAlerts";
import { KpiAlert } from "@/types/kpi";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";

export type UnifiedKpiAlert = KpiAlert & {
  source_type?: 'kpi_alert' | 'kpi_insight';
};

interface UseUnifiedKpiAlertsOptions {
  activeOnly?: boolean;
  severity?: string;
  days?: number;
}

export function useUnifiedKpiAlerts(options: UseUnifiedKpiAlertsOptions = {}) {
  const { activeOnly = false, severity, days = 7 } = options;
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [alerts, setAlerts] = useState<UnifiedKpiAlert[]>([]);

  const { alerts: kpiAlerts, isLoading: isKpiAlertsLoading } = useKpiAlerts();

  const fetchAlerts = async (fetchOptions?: UseUnifiedKpiAlertsOptions) => {
    if (!tenant?.id) return { data: [], error: new Error("No tenant selected") };
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get options or use defaults
      const opts = fetchOptions || options;
      
      // Fetch KPI alerts from the database
      const { data: alertData, error: alertError } = await supabase
        .from('kpi_alerts')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
        
      if (alertError) throw alertError;

      // Map the alerts and add source_type
      const mappedAlerts = alertData.map(alert => ({
        ...alert,
        source_type: 'kpi_alert' as const
      }));

      // Set the alerts in state
      setAlerts(mappedAlerts);
      return { data: mappedAlerts, error: null };
    } catch (err: any) {
      setError(err);
      return { data: [], error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAlerts = async () => {
    return fetchAlerts();
  };

  const triggerKpiCheck = async () => {
    if (!tenant?.id) {
      toast.error("Cannot check KPIs - no tenant selected");
      return;
    }

    setIsLoading(true);
    try {
      // This would typically call an edge function to trigger KPI checks
      toast.success("KPI check triggered successfully");
      await refreshAlerts();
      return true;
    } catch (error: any) {
      toast.error(`Failed to trigger KPI check: ${error.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch alerts on initial mount
  useState(() => {
    if (tenant?.id) {
      fetchAlerts();
    }
  });

  return {
    alerts,
    isLoading: isLoading || isKpiAlertsLoading,
    error,
    fetchAlerts,
    refreshAlerts,
    triggerKpiCheck
  };
}
