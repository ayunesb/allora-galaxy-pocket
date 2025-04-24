
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

export interface CronJobMetric {
  function_name: string;
  execution_time_ms: number;
  success_rate: number;
  error_count: number;
  total_executions: number;
  last_execution_at: string;
}

export interface SystemHealthAlert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  status: string;
  created_at: string;
}

export function useSystemHealthMetrics() {
  const { tenant } = useTenant();

  const cronJobMetricsQuery = useQuery<CronJobMetric[]>({
    queryKey: ['system-health-cron-metrics', tenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cron_job_metrics')
        .select('*')
        .eq('tenant_id', tenant?.id)
        .order('last_execution_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });

  const systemHealthAlertsQuery = useQuery<SystemHealthAlert[]>({
    queryKey: ['system-health-alerts', tenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_health_alerts')
        .select('*')
        .eq('tenant_id', tenant?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });

  return {
    cronJobMetrics: cronJobMetricsQuery.data || [],
    systemHealthAlerts: systemHealthAlertsQuery.data || [],
    isLoading: cronJobMetricsQuery.isLoading || systemHealthAlertsQuery.isLoading,
    error: cronJobMetricsQuery.error || systemHealthAlertsQuery.error,
  };
}
