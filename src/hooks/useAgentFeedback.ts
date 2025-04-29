
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { AgentFeedback } from '@/types/agent';

export function useAgentFeedback(agentName?: string) {
  const [feedback, setFeedback] = useState<AgentFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { tenant } = useTenant();

  useEffect(() => {
    async function loadFeedback() {
      if (!tenant?.id) return;
      
      try {
        setIsLoading(true);
        const query = supabase
          .from('agent_feedback')
          .select('*')
          .eq('tenant_id', tenant.id);
          
        if (agentName) {
          query.eq('agent', agentName);
        }
        
        const { data, error: apiError } = await query.order('created_at', { ascending: false });
        
        if (apiError) throw apiError;
        
        // Convert to AgentFeedback type with required fields
        const typedFeedback: AgentFeedback[] = data.map(item => ({
          id: item.id,
          agent: item.agent,
          feedback: item.feedback || '',
          rating: item.rating || 0,
          type: item.type || '',
          task_id: item.task_id || '',
          tenant_id: item.tenant_id,
          created_at: item.created_at,
          from_agent: '', // Default values for required fields in AgentFeedback
          to_agent: '',
          strategy_id: ''
        }));
        
        setFeedback(typedFeedback);
        setError(null);
      } catch (err) {
        console.error('Error fetching agent feedback:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch feedback'));
      } finally {
        setIsLoading(false);
      }
    }
    
    loadFeedback();
  }, [tenant, agentName]);

  const addFeedback = async (newFeedback: Omit<AgentFeedback, 'id' | 'created_at' | 'tenant_id'>) => {
    if (!tenant?.id) return null;
    
    try {
      const { data, error: apiError } = await supabase
        .from('agent_feedback')
        .insert([
          {
            ...newFeedback,
            tenant_id: tenant.id
          }
        ])
        .select();
        
      if (apiError) throw apiError;
      
      // Update local state
      if (data) {
        setFeedback(prev => [data[0] as AgentFeedback, ...prev]);
      }
      
      return data;
    } catch (err) {
      console.error('Error adding feedback:', err);
      return null;
    }
  };
  
  return { feedback, isLoading, error, addFeedback };
}
