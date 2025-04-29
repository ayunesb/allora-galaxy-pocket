
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { toast } from 'sonner';
import type { Strategy } from '@/types/strategy';

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
  // Add any other fields as needed
}

export function useStrategyDetail(strategyId: string) {
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

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

  return {
    strategy,
    isLoading: isLoading || isLoadingStrategy,
    updateStrategy: updateStrategy.mutate
  };
}
