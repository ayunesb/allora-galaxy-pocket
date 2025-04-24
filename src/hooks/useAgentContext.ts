
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/hooks/useTenant";
import type { AgentProfile } from "@/app/agents/hooks/useAgentProfile";

export function useAgentContext() {
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();
  const { toast } = useToast();

  useEffect(() => {
    if (!tenant?.id) return;

    const fetchActiveAgent = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("agent_profiles")
          .select("*")
          .eq("tenant_id", tenant.id)
          .order("last_memory_update", { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;
        setAgentProfile(data);
      } catch (err) {
        console.error("Error fetching agent profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveAgent();
  }, [tenant?.id]);

  const getAgentSystemPrompt = () => {
    if (!agentProfile) return "";
    
    return `You are ${agentProfile.agent_name}, an AI ${agentProfile.role} assistant.
Tone: ${agentProfile.tone || "professional"}
Language: ${agentProfile.language || "English"}
Tools available: ${agentProfile.enabled_tools?.join(", ") || "None"}
${agentProfile.memory_scope?.length ? `Memory scope: ${agentProfile.memory_scope.join(", ")}` : ""}`;
  };

  return {
    agentProfile,
    isLoading,
    getAgentSystemPrompt
  };
}
