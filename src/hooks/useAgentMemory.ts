
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

interface AgentMemoryInput {
  agentName?: string;
  context: string;
  type?: 'history' | 'preference' | 'feedback'; 
  xpDelta?: number;
  is_user_submitted?: boolean;
}

export function useAgentMemory() {
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();
  const { toast } = useToast();

  const logAgentMemory = async ({
    agentName = "CEO",
    context,
    type = "history",
    xpDelta = 1,
    is_user_submitted = false
  }: AgentMemoryInput) => {
    if (!tenant?.id) {
      console.error("No tenant ID for agent memory logging");
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("agent_memory").insert({
        tenant_id: tenant.id,
        agent_name: agentName,
        context,
        type,
        xp_delta: xpDelta,
        is_user_submitted,
        // Add a summary to make it easier to search
        summary: context.substring(0, 100) + (context.length > 100 ? "..." : ""),
        // Add some default tags based on the content
        tags: extractTags(context)
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error logging agent memory:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getAgentMemories = async (agentName: string, limit = 10) => {
    if (!tenant?.id) return [];

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("agent_memory")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("agent_name", agentName)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching agent memories:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to extract tags from content
  const extractTags = (content: string): string[] => {
    const tags = [];
    
    // Extract topics from content using simple keyword detection
    if (content.toLowerCase().includes("strategy")) tags.push("strategy");
    if (content.toLowerCase().includes("campaign")) tags.push("campaign");
    if (content.toLowerCase().includes("customer")) tags.push("customer");
    if (content.toLowerCase().includes("sales")) tags.push("sales");
    if (content.toLowerCase().includes("marketing")) tags.push("marketing");
    
    // Always add a base tag for filtering
    tags.push("memory");
    
    return tags;
  };

  return {
    logAgentMemory,
    getAgentMemories,
    isLoading
  };
}
