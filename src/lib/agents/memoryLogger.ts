
import { supabase } from "@/integrations/supabase/client";
import type { Strategy } from "@/types/strategy";

export async function logAgentMemory({
  tenantId,
  agentName = 'CEO',
  context,
  type = 'history'
}: {
  tenantId: string;
  agentName?: string;
  context: string;
  type?: 'preference' | 'history' | 'feedback';
}) {
  try {
    const { error } = await supabase
      .from('agent_memory')
      .insert({
        tenant_id: tenantId,
        agent_name: agentName,
        context,
        type
      });

    if (error) {
      console.error('Error logging agent memory:', error);
    }
  } catch (err) {
    console.error('Unexpected error in memory logging:', err);
  }
}

export async function getAgentMemory({
  tenantId,
  agentName = 'CEO',
  limit = 50
}: {
  tenantId: string;
  agentName?: string;
  limit?: number;
}) {
  try {
    const { data: memories, error } = await supabase
      .from('agent_memory')
      .select('context')
      .eq('tenant_id', tenantId)
      .eq('agent_name', agentName)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching agent memory:', error);
      return [];
    }

    return memories.map(m => m.context);
  } catch (err) {
    console.error('Unexpected error fetching memories:', err);
    return [];
  }
}
