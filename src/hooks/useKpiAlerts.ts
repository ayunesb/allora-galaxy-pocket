
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import type { KpiAlert } from "@/types/kpi";

export function useKpiAlerts(options: { days?: number; activeOnly?: boolean; severity?: string } = {}) {
  const { days = 7, activeOnly = false, severity } = options;
  const { tenant } = useTenant();
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
  const queryClient = useQueryClient();

  // Main query for KPI alerts
  const alertsQuery = useQuery({
    queryKey: ['kpi-alerts', tenant?.id, startDate, activeOnly, severity],
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
        
        if (severity) {
          query = query.eq('severity', severity);
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

  // Query for campaign insights
  const campaignInsightsQuery = useQuery({
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

  // Mutation to trigger KPI check
  const triggerKpiCheckMutation = useMutation({
    mutationFn: async (customTenantId?: string) => {
      if (!tenant?.id && !customTenantId) throw new Error('No tenant selected');
      
      const targetTenantId = customTenantId || tenant?.id;
      
      const { error } = await supabase.functions.invoke('check-kpi-alerts', {
        body: { tenant_id: targetTenantId }
      });
      
      if (error) throw error;
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-insights'] });
      toast.success("KPI check completed successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to run KPI check", {
        description: error?.message || "An unexpected error occurred"
      });
    }
  });

  // Mutation to resolve an alert
  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      if (!tenant?.id) throw new Error('No tenant selected');
      
      const { error } = await supabase
        .from('kpi_insights')
        .update({ outcome: 'resolved' })
        .eq('id', alertId)
        .eq('tenant_id', tenant.id);
      
      if (error) throw error;
      
      return alertId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-alerts'] });
      toast.success("Alert marked as resolved");
    },
    onError: (error: any) => {
      toast.error("Failed to resolve alert", {
        description: error?.message || "An unexpected error occurred"
      });
    }
  });

  const refreshAlerts = () => {
    queryClient.invalidateQueries({ queryKey: ['kpi-alerts'] });
    queryClient.invalidateQueries({ queryKey: ['campaign-insights'] });
  };

  // Simplified wrapper for the mutation
  const triggerKpiCheck = (customTenantId?: string) => {
    return triggerKpiCheckMutation.mutate(customTenantId);
  };

  // Simplified wrapper for the resolve mutation
  const resolveAlert = (alertId: string) => {
    return resolveAlertMutation.mutate(alertId);
  };

  return {
    alerts: alertsQuery.data,
    campaignInsights: campaignInsightsQuery.data,
    isLoading: alertsQuery.isLoading || campaignInsightsQuery.isLoading,
    error: alertsQuery.error || campaignInsightsQuery.error,
    refreshAlerts,
    triggerKpiCheck,
    resolveAlert,
    isTriggeringCheck: triggerKpiCheckMutation.isPending,
    isResolvingAlert: resolveAlertMutation.isPending
  };
}
