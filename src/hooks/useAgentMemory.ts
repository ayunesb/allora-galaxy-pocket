
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { toast } from 'sonner';

export interface AgentMemory {
  id: string;
  tenant_id: string;
  agent_name: string;
  context: string;
  type: 'preference' | 'history' | 'feedback';
  timestamp: string;
  ai_feedback?: string | null;
  ai_rating?: number | null;
  is_user_submitted: boolean;
  remix_count: number;
  xp_delta?: number | null;
}

export function useAgentMemory(agentName?: string) {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch agent memory entries
  const { data: memories = [], isLoading } = useQuery({
    queryKey: ['agent-memory', tenant?.id, agentName],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const query = supabase
        .from('agent_memory')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('timestamp', { ascending: false });
        
      if (agentName) {
        query.eq('agent_name', agentName);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching agent memory:', error);
        throw error;
      }
      
      return data as AgentMemory[];
    },
    enabled: !!tenant?.id
  });

  // Log a new memory entry
  const createMemoryMutation = useMutation({
    mutationFn: async (memoryData: {
      agent_name: string;
      context: string;
      type: 'preference' | 'history' | 'feedback';
      ai_feedback?: string;
      ai_rating?: number;
      is_user_submitted?: boolean;
      xp_delta?: number;
    }) => {
      if (!tenant?.id) {
        throw new Error('No tenant selected');
      }
      
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('agent_memory')
        .insert({
          tenant_id: tenant.id,
          agent_name: memoryData.agent_name,
          context: memoryData.context,
          type: memoryData.type,
          ai_feedback: memoryData.ai_feedback,
          ai_rating: memoryData.ai_rating,
          is_user_submitted: !!memoryData.is_user_submitted,
          xp_delta: memoryData.xp_delta
        })
        .select()
        .single();
      
      setIsSubmitting(false);
      
      if (error) {
        console.error('Error creating memory:', error);
        throw error;
      }
      
      return data as AgentMemory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-memory', tenant?.id, agentName] });
    }
  });
  
  // Update an existing memory (e.g., add AI feedback)
  const updateMemoryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<AgentMemory> }) => {
      if (!tenant?.id) {
        throw new Error('No tenant selected');
      }
      
      const { data, error } = await supabase
        .from('agent_memory')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', tenant.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating memory:', error);
        throw error;
      }
      
      return data as AgentMemory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-memory', tenant?.id, agentName] });
    }
  });
  
  // Increment remix count for a memory
  const incrementRemixMutation = useMutation({
    mutationFn: async (memoryId: string) => {
      if (!tenant?.id) {
        throw new Error('No tenant selected');
      }
      
      const { error } = await supabase.rpc('increment_remix_count', { memory_id: memoryId });
      
      if (error) {
        console.error('Error incrementing remix count:', error);
        throw error;
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-memory', tenant?.id, agentName] });
      toast.success('Memory remixed!');
    }
  });
  
  const logAgentMemory = async (params: {
    agentName: string;
    context: string;
    type: 'preference' | 'history' | 'feedback';
    ai_feedback?: string;
    ai_rating?: number;
    is_user_submitted?: boolean;
    xp_delta?: number;
  }) => {
    try {
      await createMemoryMutation.mutateAsync({
        agent_name: params.agentName, // Converting agentName to agent_name
        context: params.context,
        type: params.type,
        ai_feedback: params.ai_feedback,
        ai_rating: params.ai_rating,
        is_user_submitted: params.is_user_submitted,
        xp_delta: params.xp_delta
      });
      return true;
    } catch (error) {
      console.error('Failed to log agent memory:', error);
      return false;
    }
  };
  
  const updateAgentMemory = async (id: string, updates: Partial<AgentMemory>) => {
    try {
      await updateMemoryMutation.mutateAsync({ id, updates });
      return true;
    } catch (error) {
      console.error('Failed to update agent memory:', error);
      return false;
    }
  };
  
  const remixMemory = async (memoryId: string) => {
    try {
      await incrementRemixMutation.mutateAsync(memoryId);
      return true;
    } catch (error) {
      console.error('Failed to remix memory:', error);
      return false;
    }
  };
  
  return {
    memories,
    isLoading,
    isSubmitting,
    logAgentMemory,
    updateAgentMemory,
    remixMemory,
    getMostRemixed: () => [...memories].sort((a, b) => (b.remix_count || 0) - (a.remix_count || 0)).slice(0, 5)
  };
}
