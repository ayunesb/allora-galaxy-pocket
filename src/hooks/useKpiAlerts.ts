
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

export interface KpiAlert {
  id: string;
  metric: string;
  threshold: number;
  condition: 'above' | 'below';
  triggered_at?: string;
  status: 'active' | 'triggered' | 'resolved';
  tenant_id: string;
  created_at?: string;
}

export function useKpiAlerts() {
  const { tenant } = useTenant();

  const { data: alerts = [], isLoading, error } = useQuery({
    queryKey: ['kpi-alerts', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

      const { data, error } = await supabase
        .from('kpi_alerts')
        .select('*')
        .eq('tenant_id', tenant.id);
        
      if (error) {
        console.error("Error fetching KPI alerts:", error);
        throw error;
      }

      return data as KpiAlert[] || [];
    },
    enabled: !!tenant?.id,
  });

  return {
    alerts,
    isLoading,
    error
  };
}
