
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { toast } from "sonner";
import type { Strategy } from "@/types/strategy";
import { useStrategySystem } from "./useStrategySystem";

export function useStrategyDetail(id: string | undefined) {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { logActivity } = useSystemLogs();
  const [comparisonData, setComparisonData] = useState<any>(null);
  const { createStrategyVersion, versions, compareVersions } = useStrategySystem();

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
        description: "The strategy has been approved and is now active"
      });

      logActivity({
        event_type: 'strategy_approved',
        message: `Approved strategy: ${strategy?.title}`,
        meta: { strategy_id: id }
      });

    } catch (error) {
      toast({
        variant: "destructive",
        description: "Could not approve the strategy. Please try again."
      });
    }
  };

  const handleDecline = () => {
    if (!tenant?.id || !user?.id || !strategy) return;

    const saveFeedback = async () => {
      await supabase
        .from('strategy_feedback')
        .insert({
          tenant_id: tenant.id,
          user_id: user.id,
          strategy_title: strategy.title,
          action: 'dismissed'
        });

      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      queryClient.invalidateQueries({ queryKey: ['strategy-feedback', id] });
      
      toast({
        description: 'Strategy has been declined'
      });
      
      logActivity({
        event_type: 'strategy_declined',
        message: `Declined strategy: ${strategy.title}`,
        meta: {
          strategy_id: id,
          action: 'dismissed'
        }
      });
    };

    saveFeedback();
  };

  const handleRegenerate = () => {
    if (!strategy) return;
    
    toast({
      description: "The AI is creating a new version of this strategy"
    });
    
    logActivity({ 
      event_type: 'strategy_regenerated',
      message: `Requested regeneration of strategy: ${strategy.title}`,
      meta: { strategy_id: id }
    });
  };

  const handleCreateVersion = async () => {
    if (!strategy) return;
    
    await createStrategyVersion({
      strategyId: strategy.id,
      changes: strategy.description || ''
    });
    
    toast({
      description: "A new version of this strategy has been saved"
    });
  };

  const handleCompareVersions = async (v1: number, v2: number) => {
    if (!strategy) return;
    
    try {
      const comparison = await compareVersions(strategy.id, v1, v2);
      if (comparison) {
        setComparisonData(comparison);
      }
    } catch (error) {
      console.error("Error comparing versions:", error);
      toast({
        variant: "destructive",
        description: "Failed to compare strategy versions"
      });
    }
  };

  useEffect(() => {
    if (!tenant?.id || !strategy?.title) return;
    
    const channel = supabase
      .channel('strategy_feedback_changes')
      .on('postgres_changes', 
        {
          event: '*', 
          schema: 'public', 
          table: 'strategy_feedback',
          filter: `tenant_id=eq.${tenant.id}` 
        }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['strategy-feedback', id] });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenant?.id, strategy?.title, id, queryClient]);

  return {
    strategy,
    isLoading,
    error,
    feedbackItems,
    isLoadingFeedback,
    comparisonData,
    handleApprove,
    handleDecline,
    handleRegenerate,
    handleCreateVersion,
    handleCompareVersions
  };
}
