import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '../useTenant';
import { useSystemLogs } from '../useSystemLogs';
import { AgentCollabMessage } from '@/types/agent';
import { v4 as uuidv4 } from 'uuid';

export function useAgentCollaborationSystem() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();

  const initSession = async () => {
    if (!tenant?.id) {
      setError('No tenant ID available');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);

      // Log the session initialization
      await logActivity(
        'AGENT_COLLAB_SESSION_INIT',
        'Agent collaboration session initialized',
        { 
          session_id: newSessionId,
          tenant_id: tenant.id
        }
      );

      return newSessionId;
    } catch (err: any) {
      setError(err.message || 'Failed to initialize session');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (
    agentName: string,
    message: string,
    currentSessionId?: string
  ) => {
    if (!tenant?.id) {
      setError('No tenant ID available');
      return null;
    }

    const activeSessionId = currentSessionId || sessionId;
    if (!activeSessionId) {
      setError('No active session');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('agent_collab_messages')
        .insert({
          agent: agentName,
          message,
          session_id: activeSessionId,
          tenant_id: tenant.id
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Log the message sending
      await logActivity(
        'AGENT_COLLAB_MESSAGE_SENT',
        `Agent ${agentName} sent a message`,
        {
          session_id: activeSessionId,
          message_length: message.length,
          agent: agentName
        }
      );

      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getSessionMessages = async (currentSessionId?: string) => {
    if (!tenant?.id) {
      setError('No tenant ID available');
      return [];
    }

    const activeSessionId = currentSessionId || sessionId;
    if (!activeSessionId) {
      setError('No active session');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('agent_collab_messages')
        .select('*')
        .eq('session_id', activeSessionId)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Log the message retrieval
      await logActivity(
        'AGENT_COLLAB_MESSAGES_FETCHED',
        'Session messages retrieved',
        {
          session_id: activeSessionId,
          message_count: data?.length || 0
        }
      );

      return data as AgentCollabMessage[];
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve messages');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async (currentSessionId?: string) => {
    if (!tenant?.id) {
      return false;
    }

    const activeSessionId = currentSessionId || sessionId;
    if (!activeSessionId) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Log the session ending
      await logActivity(
        'AGENT_COLLAB_SESSION_ENDED',
        'Agent collaboration session ended',
        {
          session_id: activeSessionId,
          tenant_id: tenant.id
        }
      );

      setSessionId(null);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to end session');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initSession,
    sendMessage,
    getSessionMessages,
    endSession,
    sessionId,
    isLoading,
    error
  };
}
