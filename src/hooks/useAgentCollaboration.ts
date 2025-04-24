
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { useToast } from './use-toast';
import { v4 as uuidv4 } from 'uuid';
import { logAgentCollaboration, getAgentCollaboration } from '@/lib/agents/agentCollaboration';
import type { AgentCollabMessage } from '@/types/agent';

export function useAgentCollaboration() {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<AgentCollabMessage[]>([]);
  const { tenant } = useTenant();
  const { toast } = useToast();

  const initializeCollaboration = () => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    setMessages([]);
    return newSessionId;
  };

  const logMessage = async (agent: string, message: string) => {
    if (!tenant?.id || !sessionId) {
      console.error('Missing tenant ID or session ID for agent collaboration');
      return false;
    }

    setIsLoading(true);
    try {
      await logAgentCollaboration({
        sessionId,
        agent,
        message,
        tenantId: tenant.id
      });

      // Add to local state
      const newMessage = {
        id: uuidv4(),
        session_id: sessionId,
        agent,
        message,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, newMessage]);
      return true;
    } catch (error) {
      console.error('Error logging agent collaboration:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loadCollaborationHistory = async (collabSessionId?: string) => {
    if (!tenant?.id) {
      return false;
    }

    const targetSessionId = collabSessionId || sessionId;
    if (!targetSessionId) {
      console.error('No session ID provided for loading collaboration history');
      return false;
    }

    setIsLoading(true);
    try {
      const collabMessages = await getAgentCollaboration({
        sessionId: targetSessionId,
        tenantId: tenant.id
      });

      setMessages(collabMessages);
      if (collabSessionId && collabSessionId !== sessionId) {
        setSessionId(collabSessionId);
      }

      return true;
    } catch (error) {
      console.error('Error loading collaboration history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load collaboration history',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sessionId,
    messages,
    isLoading,
    initializeCollaboration,
    logMessage,
    loadCollaborationHistory
  };
}
