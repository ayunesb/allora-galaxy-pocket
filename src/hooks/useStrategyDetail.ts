
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
  
  const handleCreateVersion = async (comment: string): Promise<void> => {
    if (!strategy) throw new Error("No strategy to version");
    
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
      throw error; // Re-throw for the component to handle
    }
  };
  
  const handleCompareVersions = async (v1: number, v2: number): Promise<void> => {
    if (!versions) throw new Error("No versions available to compare");
    
    try {
      // Find the version objects based on version numbers
      const version1 = versions.find(v => v.version === v1);
      const version2 = versions.find(v => v.version === v2);
      
      if (!version1 || !version2) {
        throw new Error("One or both versions not found");
      }

      // Generate a representation of the changes between the versions
      // This is a simplified example - in a real app you'd probably do a more complex diff
      const changes1 = JSON.stringify(version1.data, null, 2);
      const changes2 = JSON.stringify(version2.data, null, 2);
      
      const older = {
        version: version2.version,
        changes: changes2,
        created_at: version2.created_at
      };
      
      const newer = {
        version: version1.version,
        changes: changes1,
        created_at: version1.created_at
      };
      
      // Find added, removed, and modified fields
      const keys1 = Object.keys(version1.data || {});
      const keys2 = Object.keys(version2.data || {});
      
      const added = keys1.filter(key => !keys2.includes(key));
      const removed = keys2.filter(key => !keys1.includes(key));
      
      const modified: Record<string, {before: any, after: any}> = {};
      keys1.filter(key => keys2.includes(key)).forEach(key => {
        if (JSON.stringify(version1.data[key]) !== JSON.stringify(version2.data[key])) {
          modified[key] = {
            before: version2.data[key],
            after: version1.data[key]
          };
        }
      });
      
      setComparisonData({
        older,
        newer,
        added,
        removed,
        modified
      });
    } catch (error: any) {
      toast.error("Failed to compare versions", {
        description: error.message || "An unexpected error occurred"
      });
      throw error;
    }
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
