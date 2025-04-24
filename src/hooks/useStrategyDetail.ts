
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { toast } from "sonner";
import type { Strategy } from "@/types/strategy";

export function useStrategyDetail(id: string | undefined) {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { logActivity } = useSystemLogs();

  const { data: strategy, isLoading, error } = useQuery({
    queryKey: ['strategy', id],
    queryFn: async () => {
      if (!id) throw new Error("Strategy ID is required");
      
      const { data, error } = await supabase
        .from('vault_strategies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Strategy;
    },
    enabled: !!id
  });

  const { data: feedbackItems, isLoading: isLoadingFeedback } = useQuery({
    queryKey: ['strategy-feedback', id],
    queryFn: async () => {
      if (!tenant?.id || !id) return [];
      
      const { data, error } = await supabase
        .from('strategy_feedback')
        .select(`
          id,
          action,
          user_id,
          created_at,
          tenant_id
        `)
        .eq('tenant_id', tenant.id)
        .eq('strategy_title', strategy?.title || '')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id && !!strategy?.title
  });

  const handleApprove = async () => {
    try {
      await supabase
        .from('vault_strategies')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', id);

      toast({
        title: "Strategy approved",
        description: "The strategy has been approved and is now active"
      });

      logActivity({
        event_type: 'strategy_approved',
        message: `Approved strategy: ${strategy?.title}`,
        meta: { strategy_id: id }
      });

    } catch (error) {
      toast({
        title: "Error approving strategy",
        description: "Could not approve the strategy. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    strategy,
    isLoading,
    error,
    feedbackItems,
    isLoadingFeedback,
    handleApprove
  };
}
