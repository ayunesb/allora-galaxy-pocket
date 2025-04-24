
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { format, subDays } from "date-fns";
import type { KpiAlert } from "@/types/kpi";

export function useKpiAlerts(options: { days?: number; activeOnly?: boolean } = {}) {
  const { days = 7, activeOnly = false } = options;
  const { tenant } = useTenant();
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading, error } = useQuery({
    queryKey: ['kpi-alerts', tenant?.id, startDate, activeOnly],
    queryFn: async () => {
      if (!tenant?.id) return [];

      try {
        let query = supabase
          .from('kpi_insights')
          .select('*')
          .eq('tenant_id', tenant.id)
          .gte('created_at', startDate)
          .order('created_at', { ascending: false });

        if (activeOnly) {
          query = query.eq('outcome', 'pending');
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Error fetching KPI alerts:', err);
        throw err;
      }
    },
    enabled: !!tenant?.id,
  });

  const { data: campaignInsights = [] } = useQuery({
    queryKey: ['campaign-insights', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

      try {
        // Get insights tied to campaigns
        const { data, error } = await supabase
          .from('kpi_insights')
          .select(`
            *,
            campaigns!inner(
              id,
              name,
              status
            )
          `)
          .eq('tenant_id', tenant.id)
          .not('campaign_id', 'is', null)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Error fetching campaign insights:', err);
        return [];
      }
    },
    enabled: !!tenant?.id,
  });

  const refreshAlerts = () => {
    queryClient.invalidateQueries({ queryKey: ['kpi-alerts'] });
    queryClient.invalidateQueries({ queryKey: ['campaign-insights'] });
  };

  // New: Trigger a KPI check via the edge function
  const triggerKpiCheck = async () => {
    if (!tenant?.id) return;
    
    try {
      await supabase.functions.invoke('check-kpi-alerts', {
        body: { tenant_id: tenant.id }
      });
      refreshAlerts();
    } catch (err) {
      console.error('Error triggering KPI check:', err);
    }
  };

  return {
    alerts,
    campaignInsights,
    isLoading,
    error,
    refreshAlerts,
    triggerKpiCheck
  };
}
