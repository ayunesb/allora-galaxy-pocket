
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";

export interface SystemMetric {
  id: string;
  metric_name: string;
  value: number;
  recorded_at: string;
}

export interface CronJobMetric {
  id: string;
  function_name: string;
  execution_time_ms: number;
  success_rate: number;
  error_count: number;
  total_executions: number;
  last_execution_at: string;
}

export interface SystemAlert {
  id: string;
  alert_type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

export function useSystemHealthMetrics() {
  const { tenant } = useTenant();
  
  const { data: metrics = [], isLoading: isLoadingMetrics, error: metricsError, refetch: refetchMetrics } = useQuery({
    queryKey: ['system-metrics', tenant?.id],
    queryFn: async () => {
      if (!tenant) return [];
      
      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('recorded_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      return data;
    },
    enabled: !!tenant
  });
  
  const { data: cronJobMetrics = [], isLoading: isLoadingCronJobs, error: cronJobsError } = useQuery({
    queryKey: ['cron-job-metrics', tenant?.id],
    queryFn: async () => {
      if (!tenant) return [];
      
      const { data, error } = await supabase
        .from('cron_job_metrics')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('last_execution_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!tenant
  });
  
  const { data: systemHealthAlerts = [], isLoading: isLoadingAlerts, error: alertsError } = useQuery({
    queryKey: ['system-alerts', tenant?.id],
    queryFn: async () => {
      if (!tenant) return [];
      
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!tenant
  });
  
  const isLoading = isLoadingMetrics || isLoadingCronJobs || isLoadingAlerts;
  const error = metricsError || cronJobsError || alertsError;
  
  const refetch = () => {
    refetchMetrics();
  };
  
  return {
    metrics,
    cronJobMetrics,
    systemHealthAlerts,
    isLoading,
    error,
    refetch
  };
}
