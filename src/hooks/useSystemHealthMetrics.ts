
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';

export interface SystemHealthMetric {
  id: string;
  metric_name: string;
  value: number;
  recorded_at: string;
  metadata?: Record<string, any>;
}

export interface CronJobMetric {
  id: string;
  function_name: string;
  success_rate: number;
  error_count: number;
  total_executions: number;
  last_execution_at: string;
}

export interface SystemHealthAlert {
  id: string;
  alert_type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  status: 'active' | 'resolved';
}

export function useSystemHealthMetrics() {
  const { tenant } = useTenant();

  const { 
    data: metrics = [],
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['system-health-metrics', tenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      return data as SystemHealthMetric[];
    },
    enabled: true,
  });

  const {
    data: cronJobMetrics = [],
    isLoading: cronJobsLoading,
    error: cronJobsError,
    refetch: refetchCronJobs
  } = useQuery({
    queryKey: ['cron-job-metrics', tenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cron_job_metrics')
        .select('*')
        .order('last_execution_at', { ascending: false });

      if (error) throw error;
      return data as CronJobMetric[];
    },
    enabled: true,
  });

  const {
    data: systemHealthAlerts = [],
    isLoading: alertsLoading,
    error: alertsError,
    refetch: refetchAlerts
  } = useQuery({
    queryKey: ['system-health-alerts', tenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_health_alerts')
        .select('*')
        .eq('status', 'active')
        .order('severity', { ascending: false });

      if (error) throw error;
      return data as SystemHealthAlert[];
    },
    enabled: true,
  });

  const isLoading = metricsLoading || cronJobsLoading || alertsLoading;
  const error = metricsError || cronJobsError || alertsError;

  const refetchAll = async () => {
    await Promise.all([
      refetchMetrics(),
      refetchCronJobs(),
      refetchAlerts()
    ]);
  };

  return {
    metrics,
    cronJobMetrics,
    systemHealthAlerts,
    isLoading,
    error,
    refetch: refetchAll
  };
}
