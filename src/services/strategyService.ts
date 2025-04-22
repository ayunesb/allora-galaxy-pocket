
import { supabase } from "@/integrations/supabase/client";

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
  return data;
}
