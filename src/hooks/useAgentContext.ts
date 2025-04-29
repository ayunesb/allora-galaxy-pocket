
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { AgentProfile } from "@/types/agent";

export function useAgentContext() {
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { tenant } = useTenant();

  const loadAgentProfile = useCallback(async (agentId: string) => {
    if (!tenant?.id) return null;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("agent_profiles")
        .select("*")
        .eq("id", agentId)
        .eq("tenant_id", tenant.id)
        .single();

      if (error) throw error;
      
      setAgentProfile(data as AgentProfile);
      return data;
    } catch (error) {
      console.error("Error loading agent profile:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [tenant]);
  
  const getAgentSystemPrompt = useCallback(() => {
    if (!agentProfile) return "";
    
    return `You are ${agentProfile.agent_name}, a ${agentProfile.role} focused on helping with ${agentProfile.tone} communication.
    Always respond in a ${agentProfile.tone} tone using ${agentProfile.language}.`;
  }, [agentProfile]);
  
  return { agentProfile, isLoading, loadAgentProfile, getAgentSystemPrompt };
}
