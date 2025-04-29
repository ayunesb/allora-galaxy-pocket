
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { AgentCollabMessage } from '@/types/agent';
import { v4 as uuidv4 } from 'uuid';

export function useAgentCollaboration(initialSessionId?: string) {
  const [sessionId, setSessionId] = useState<string>(initialSessionId || '');
  const [messages, setMessages] = useState<AgentCollabMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { tenant } = useTenant();

  // Initialize a new collaboration session
  const initializeCollaboration = useCallback(() => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    setMessages([]);
    return newSessionId;
  }, []);

  // Load collaboration history for a given session
  const loadCollaborationHistory = useCallback(async (sid: string) => {
    if (!tenant?.id || !sid) return [];
    
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('agent_collaboration')
        .select('*')
        .eq('session_id', sid)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: true });
      
      if (fetchError) throw fetchError;
      
      const typedMessages = data as AgentCollabMessage[];
      setMessages(typedMessages);
      return typedMessages;
    } catch (err) {
      console.error('Error loading collaboration history:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch collaboration history'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [tenant]);

  // Log a new message in the collaboration session
  const logMessage = useCallback(async (agent: string, message: string) => {
    if (!tenant?.id || !sessionId) {
      console.error('Cannot log message: no tenant ID or session ID');
      return null;
    }
    
    setIsLoading(true);
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
      
      const createdMessage = data?.[0] as AgentCollabMessage;
      setMessages(prev => [...prev, createdMessage]);
      return createdMessage;
    } catch (err) {
      console.error('Error logging message:', err);
      setError(err instanceof Error ? err : new Error('Failed to send message'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, tenant]);

  // For backward compatibility with existing code using sendMessage
  const sendMessage = logMessage;

  return { 
    sessionId,
    messages, 
    isLoading, 
    error, 
    sendMessage,
    logMessage,
    initializeCollaboration,
    loadCollaborationHistory
  };
}
