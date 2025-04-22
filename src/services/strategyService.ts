
import { supabase } from "@/integrations/supabase/client";
import { logAgentMemory } from "@/lib/agents/memoryLogger";
import type { Strategy } from "@/types/strategy";

export interface SaveStrategyInput {
  title: string;
  description: string;
  industry: string;
  goal: string;
  tenant_id: string;
  confidence?: string;
}

export async function saveStrategy(input: SaveStrategyInput) {
  const { data, error } = await supabase
    .from('vault_strategies')
    .insert({
      ...input,
      status: 'draft'
    })
    .select()
    .single();

  if (error) throw error;

  // Log memory of strategy creation
  await logAgentMemory({
    tenantId: input.tenant_id,
    context: `Created strategy: ${input.title} in ${input.industry} industry with goal: ${input.goal}`,
    type: 'history'
  });

  return data;
}
