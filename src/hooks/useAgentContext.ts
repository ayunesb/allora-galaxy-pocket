
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { AgentProfile } from "@/app/agents/hooks/useAgentProfile";

export function useAgentContext() {
  const { tenant } = useTenant();

  const { data: agentProfile, isLoading } = useQuery({
    queryKey: ["agent-profile", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;

      const { data, error } = await supabase
        .from("agent_profiles")
        .select("*")
        .eq("tenant_id", tenant.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No agent profile found
          return null;
        }
        throw error;
      }

      return data as AgentProfile;
    },
    enabled: !!tenant?.id,
  });

  // Format the agent system prompt
  const getAgentSystemPrompt = () => {
    if (!agentProfile) return "";
    
    const channels = agentProfile.channels && agentProfile.channels.length > 0 
      ? agentProfile.channels.join(", ") 
      : "all channels";
    
    return `You are ${agentProfile.agent_name}, an AI ${agentProfile.role}. Your tone is ${agentProfile.tone}. Your preferred channels are ${channels}.`;
  };

  return {
    agentProfile,
    isLoading,
    getAgentSystemPrompt,
  };
}
