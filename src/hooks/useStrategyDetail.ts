
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Strategy, StrategyVersion, StrategyVersionDiff } from '@/types/strategy';
import { toast } from 'sonner';

export function useStrategyDetail(strategyId?: string) {
  const queryClient = useQueryClient();
  const [comparisonData, setComparisonData] = useState<StrategyVersionDiff | null>(null);
  
  const { data: strategy, isLoading, error } = useQuery({
    queryKey: ['strategy', strategyId],
    queryFn: async () => {
      if (!strategyId) throw new Error("Strategy ID is required");
      
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', strategyId)
        .single();
        
      if (error) throw error;
      return data as Strategy;
    },
    enabled: !!strategyId
  });
  
  const { data: versions } = useQuery({
    queryKey: ['strategy-versions', strategyId],
    queryFn: async () => {
      if (!strategyId) return [];
      
      const { data, error } = await supabase
        .from('strategy_versions')
        .select('*')
        .eq('strategy_id', strategyId)
        .order('version', { ascending: false });
        
      if (error) throw error;
      return data as StrategyVersion[];
    },
    enabled: !!strategyId
  });
  
  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!strategy) throw new Error("No strategy to approve");
      
      const { error } = await supabase
        .from('strategies')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', strategy.id);
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy', strategyId] });
      toast.success("Strategy approved successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to approve strategy", { 
        description: error.message || "An unexpected error occurred" 
      });
    }
  });
  
  const declineMutation = useMutation({
    mutationFn: async () => {
      if (!strategy) throw new Error("No strategy to decline");
      
      const { error } = await supabase
        .from('strategies')
        .update({ status: 'rejected' })
        .eq('id', strategy.id);
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy', strategyId] });
      toast.success("Strategy declined");
    },
    onError: (error: any) => {
      toast.error("Failed to decline strategy", { 
        description: error.message || "An unexpected error occurred" 
      });
    }
  });
  
  const regenerateMutation = useMutation({
    mutationFn: async () => {
      if (!strategy) throw new Error("No strategy to regenerate");
      
      // This would be implemented according to your regeneration logic
      // For now, we'll just mock it
      const { error } = await supabase
        .from('strategies')
        .update({ status: 'pending' })
        .eq('id', strategy.id);
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy', strategyId] });
      toast.success("Strategy regeneration started");
    },
    onError: (error: any) => {
      toast.error("Failed to start regeneration", { 
        description: error.message || "An unexpected error occurred" 
      });
    }
  });
  
  const handleCreateVersion = async (comment: string) => {
    if (!strategy) return;
    
    try {
      const nextVersion = versions && versions.length > 0 
        ? Math.max(...versions.map(v => v.version)) + 1 
        : 1;
        
      const { error } = await supabase
        .from('strategy_versions')
        .insert({
          strategy_id: strategy.id,
          version: nextVersion,
          data: strategy,
          comment
        });
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['strategy-versions', strategyId] });
      toast.success("Strategy version created");
    } catch (error: any) {
      toast.error("Failed to create version", { 
        description: error.message || "An unexpected error occurred" 
      });
    }
  };
  
  const handleCompareVersions = (v1: StrategyVersion, v2: StrategyVersion) => {
    // This function would compare two versions and show differences
    // For this example, we'll just set a mock comparison
    const diff: StrategyVersionDiff = {
      added: ['new field'],
      removed: ['old field'],
      modified: {
        description: {
          before: v1.data.description,
          after: v2.data.description
        }
      }
    };
    
    setComparisonData(diff);
  };
  
  return {
    strategy,
    isLoading,
    error,
    versions,
    comparisonData,
    handleApprove: () => approveMutation.mutate(),
    handleDecline: () => declineMutation.mutate(),
    handleRegenerate: () => regenerateMutation.mutate(),
    handleCreateVersion,
    handleCompareVersions
  };
}
