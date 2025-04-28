import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AgentFeedback } from '@/types/agent';

export function useAgentFeedback(agentName?: string) {
  const [feedback, setFeedback] = useState<AgentFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        let query = supabase.from('agent_feedback').select('*');
        
        if (agentName) {
          query = query.eq('agent', agentName);
        }
        
        const { data, error: apiError } = await query.order('created_at', { ascending: false });
        
        if (apiError) throw apiError;
        
        // Cast the data to AgentFeedback type with type assertion
        setFeedback(data as unknown as AgentFeedback[]);
      } catch (err) {
        console.error('Error fetching agent feedback:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch agent feedback'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedback();
  }, [agentName]);

  return { feedback, loading, error };
}
