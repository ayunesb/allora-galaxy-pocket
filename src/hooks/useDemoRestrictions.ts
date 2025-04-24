
import { useTenant } from "@/hooks/useTenant";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDemoRestrictions() {
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isDemoMode = tenant?.isDemo ?? false;

  const restrictDemoAction = (action: string): boolean => {
    if (isDemoMode) {
      toast({
        title: "Demo Mode Restriction",
        description: `This action (${action}) is not available in demo mode`,
        variant: "destructive"
      });
      return true;
    }
    return false;
  };

  // Manual reset for demo tenant
  const resetDemo = useMutation({
    mutationFn: async () => {
      if (!isDemoMode || !tenant?.id) {
        throw new Error("Reset can only be performed on demo tenants");
      }

      const { data, error } = await supabase.functions.invoke('reset-demo-tenant', {
        body: { tenant_id: tenant.id }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['campaign-performance-data'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-kpi-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['kpi-insights'] });
      
      toast({
        title: "Demo Reset",
        description: "The demo tenant has been reset successfully",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error("Error resetting demo tenant:", error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset the demo tenant",
        variant: "destructive"
      });
    }
  });

  // Get last reset time
  const { data: lastReset } = useQuery({
    queryKey: ['demo-last-reset', tenant?.id],
    queryFn: async () => {
      if (!isDemoMode || !tenant?.id) return null;
      
      const { data } = await supabase
        .from('cron_job_logs')
        .select('ran_at')
        .eq('function_name', 'reset-demo-tenant')
        .eq('status', 'success')
        .order('ran_at', { ascending: false })
        .limit(1)
        .single();
        
      return data?.ran_at ? new Date(data.ran_at) : null;
    },
    enabled: isDemoMode && !!tenant?.id
  });

  return {
    isDemoMode,
    restrictDemoAction,
    resetDemo: resetDemo.mutate,
    isResetting: resetDemo.isPending,
    lastResetTime: lastReset
  };
}
