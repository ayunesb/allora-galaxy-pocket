
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { toast } from 'sonner';
import type { Strategy } from '@/types/strategy';
import { useSystemLogs } from './useSystemLogs';

interface UpdateStrategyParams {
  id: string;
  title?: string;
  description?: string;
  impact_score?: number;
  health_score?: number;
  diagnosis?: any;
  status?: string;
  updated_at?: string;
  tags?: string[];
}

export function useStrategyDetail(strategyId: string) {
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { logActivity } = useSystemLogs();

  // Strategy versions data (using strategies table)
  const { data: versions } = useQuery({
    queryKey: ['strategy-versions', strategyId],
    queryFn: async () => {
      if (!tenant?.id || !strategyId) return [];
      
      const { data, error } = await supabase
        .from('strategies')
        .select('id, created_at, updated_at')
        .eq('id', strategyId)
        .eq('tenant_id', tenant.id)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      // Create synthetic versions from strategies history
      const syntheticVersions = (data || []).map((item, index) => ({
        id: item.id,
        strategy_id: item.id,
        version: index + 1,
        changes: `Version ${index + 1}`,
        created_at: item.created_at || item.updated_at || new Date().toISOString()
      }));
      
      return syntheticVersions;
    },
    enabled: !!tenant?.id && !!strategyId
  });

  // Get strategy details
  const { data: strategy, isLoading: isLoadingStrategy } = useQuery({
    queryKey: ['strategy', strategyId],
    queryFn: async () => {
      if (!tenant?.id || !strategyId) return null;

      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', strategyId)
        .eq('tenant_id', tenant.id)
        .single();

      if (error) {
        console.error('Error loading strategy:', error);
        toast.error('Failed to load strategy');
        return null;
      }

      return data as unknown as Strategy;
    },
    enabled: !!tenant?.id && !!strategyId
  });

  // Update strategy
  const updateStrategy = useMutation({
    mutationFn: async (params: UpdateStrategyParams) => {
      if (!tenant?.id) {
        throw new Error('No tenant selected');
      }

      setIsLoading(true);

      // Ensure updated_at is always present
      const updateData: Record<string, any> = {
        ...params,
        updated_at: params.updated_at || new Date().toISOString()
      };

      const { error } = await supabase
        .from('strategies')
        .update(updateData)
        .eq('id', params.id)
        .eq('tenant_id', tenant.id);

      if (error) {
        throw error;
      }

      // Log the strategy update
      await logActivity(
        'strategy_updated',
        `Strategy "${params.title || 'Unknown'}" updated`,
        { strategy_id: params.id, updates: Object.keys(params) },
        'info'
      );

      return true;
    },
    onSuccess: () => {
      toast.success('Strategy updated successfully');
      queryClient.invalidateQueries({ queryKey: ['strategy', strategyId] });
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
    },
    onError: (error) => {
      console.error('Error updating strategy:', error);
      toast.error('Failed to update strategy');
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  // Create a new strategy version
  const createNewVersion = async (changes: string) => {
    if (!tenant?.id || !strategy) {
      toast.error('Cannot create new version - missing data');
      return false;
    }

    try {
      setIsLoading(true);
      
      // Update the strategy with new timestamp to simulate a version
      const { error } = await supabase
        .from('strategies')
        .update({
          updated_at: new Date().toISOString(),
          description: `${strategy.description || ''}\n\nChanges: ${changes}`
        })
        .eq('id', strategyId)
        .eq('tenant_id', tenant.id);
        
      if (error) throw error;
      
      // Log the version creation
      await logActivity(
        'strategy_version_created',
        `New version created for strategy "${strategy.title || 'Unknown'}"`,
        {
          strategy_id: strategyId,
          changes
        },
        'info'
      );
      
      toast.success('Strategy version created');
      queryClient.invalidateQueries({ queryKey: ['strategy-versions'] });
      queryClient.invalidateQueries({ queryKey: ['strategy', strategyId] });
      
      return true;
    } catch (error) {
      console.error('Error creating strategy version:', error);
      toast.error('Failed to create new version');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh strategy data
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['strategy', strategyId] });
    queryClient.invalidateQueries({ queryKey: ['strategy-versions', strategyId] });
  };

  return {
    strategy,
    versions,
    isLoading: isLoading || isLoadingStrategy,
    updateStrategy: updateStrategy.mutate,
    createNewVersion,
    refresh,
    error: updateStrategy.error
  };
}
