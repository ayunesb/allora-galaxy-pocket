

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AgentFeedback } from '@/types/agent';
import { useToast } from '@/hooks/use-toast';

export function useAgentFeedback(agentName?: string, campaignId?: string) {
  const [feedback, setFeedback] = useState<AgentFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        let query = supabase.from('agent_feedback').select('*');
        
        if (agentName) {
          query = query.eq('agent', agentName);
        }
        
        if (campaignId) {
          query = query.eq('campaign_id', campaignId);
        }
        
        const { data, error: apiError } = await query.order('created_at', { ascending: false });
        
        if (apiError) throw apiError;
        
        // Cast the data to AgentFeedback type with type assertion
        setFeedback(data as AgentFeedback[]);
      } catch (err) {
        console.error('Error fetching agent feedback:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch agent feedback';
        setError(err instanceof Error ? err : new Error(errorMessage));
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedback();
  }, [agentName, campaignId, toast]);

  const addFeedback = async (newFeedback: Omit<AgentFeedback, 'id' | 'created_at'>) => {
    try {
      const { data, error: apiError } = await supabase
        .from('agent_feedback')
        .insert(newFeedback)
        .select()
        .single();
        
      if (apiError) throw apiError;
      
      setFeedback(prev => [data as AgentFeedback, ...prev]);
      return true;
    } catch (err) {
      console.error('Error adding feedback:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add feedback';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  return { 
    feedback, 
    loading, 
    error, 
    isLoading: loading,
    addFeedback 
  };
}
