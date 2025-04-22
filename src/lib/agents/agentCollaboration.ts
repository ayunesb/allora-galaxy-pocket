
import { supabase } from "@/integrations/supabase/client";

export interface AgentMessage {
  sessionId: string;
  agent: string;
  message: string;
  tenantId: string;
}

export async function logAgentCollaboration({
  sessionId,
  agent,
  message,
  tenantId,
}: AgentMessage) {
  try {
    const { error } = await supabase
      .from('agent_collaboration')
      .insert({
        session_id: sessionId,
        agent,
        message,
        tenant_id: tenantId
      });

    if (error) {
      console.error('Error logging agent collaboration:', error);
    }
  } catch (err) {
    console.error('Unexpected error in collaboration logging:', err);
  }
}

export async function getAgentCollaboration({
  sessionId,
  tenantId,
  limit = 50
}: {
  sessionId: string;
  tenantId: string;
  limit?: number;
}) {
  try {
    const { data: messages, error } = await supabase
      .from('agent_collaboration')
      .select('*')
      .eq('session_id', sessionId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching agent collaboration:', error);
      return [];
    }

    return messages;
  } catch (err) {
    console.error('Unexpected error fetching collaboration:', err);
    return [];
  }
}
