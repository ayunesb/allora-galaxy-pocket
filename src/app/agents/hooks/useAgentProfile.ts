
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

export interface AgentProfile {
  id: string;
  agent_name: string;
  description?: string;
  model?: string;
  tenant_id: string;
  created_at?: string;
  updated_at?: string;
  avatar_url?: string;
  personality?: string;
  specialty?: string;
  experience_level?: string;
  memory_score?: number;
  last_memory_update?: string;
  role: string;
  tone: string;
  language: string;
}

export function useAgentProfile() {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ["agent-profile", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;

      const { data, error } = await supabase
        .from("agent_profiles")
        .select("*")
        .eq("tenant_id", tenant.id)
        .single();

      if (error) throw error;
      return data as AgentProfile;
    },
    enabled: !!tenant?.id,
  });
}
