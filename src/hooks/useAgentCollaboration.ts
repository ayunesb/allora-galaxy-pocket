
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { AgentCollabMessage } from '@/types/agent';

export function useAgentCollaboration(sessionId: string) {
  const [messages, setMessages] = useState<AgentCollabMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { tenant } = useTenant();

  useEffect(() => {
    async function fetchMessages() {
      if (!tenant?.id || !sessionId) return;
      
      try {
        setIsLoading(true);
        
        const { data, error: apiError } = await supabase
          .from('agent_collaboration')
          .select('*')
          .eq('session_id', sessionId)
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: true });
        
        if (apiError) throw apiError;
        
        // Convert to AgentCollabMessage type
        const typedMessages: AgentCollabMessage[] = data.map(item => ({
          id: item.id,
          session_id: item.session_id,
          agent: item.agent,
          message: item.message,
          created_at: item.created_at,
          tenant_id: item.tenant_id
        }));
        
        setMessages(typedMessages);
      } catch (err) {
        console.error('Error fetching collaboration messages:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchMessages();
    
    // Set up subscription for real-time updates
    const channel = supabase
      .channel(`agent-collab-${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'agent_collaboration',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        const newMessage = payload.new as AgentCollabMessage;
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, tenant]);

  const sendMessage = async (agent: string, message: string) => {
    if (!tenant?.id || !sessionId) return null;
    
    try {
      const newMessage = {
        session_id: sessionId,
        agent,
        message,
        tenant_id: tenant.id
      };
      
      const { data, error: apiError } = await supabase
        .from('agent_collaboration')
        .insert([newMessage])
        .select();
      
      if (apiError) throw apiError;
      
      return data?.[0] || null;
    } catch (err) {
      console.error('Error sending message:', err);
      return null;
    }
  };

  return { messages, isLoading, error, sendMessage };
}
