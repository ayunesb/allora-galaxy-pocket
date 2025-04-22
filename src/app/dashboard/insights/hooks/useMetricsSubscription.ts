
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';

export function useMetricsSubscription() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!tenant?.id) return;

    // Subscribe to kpi_metrics changes
    const metricsChannel = supabase
      .channel('metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kpi_metrics',
          filter: `tenant_id=eq.${tenant.id}`,
        },
        () => {
          // Invalidate and refetch metrics queries
          queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
          queryClient.invalidateQueries({ queryKey: ['kpi-metrics-history'] });
          queryClient.invalidateQueries({ queryKey: ['kpi-metrics-insights'] });
        }
      )
      .subscribe();

    // Subscribe to kpi_metrics_history changes  
    const historyChannel = supabase
      .channel('metrics-history-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kpi_metrics_history',
          filter: `tenant_id=eq.${tenant.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['kpi-metrics-history'] });
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(metricsChannel);
      supabase.removeChannel(historyChannel);
    };
  }, [tenant?.id, queryClient]);
}
