
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useToast } from "@/hooks/use-toast";

export function useAgentLearningSystem() {
  const [isLearning, setIsLearning] = useState(false);
  const { tenant } = useTenant();
  const { toast } = useToast();

  const analyzeAgentPerformance = async (agentName: string) => {
    if (!tenant?.id) {
      console.error("No tenant ID for agent learning");
      return false;
    }

    setIsLearning(true);
    try {
      // Get recent interactions
      const { data: memories, error: memoriesError } = await supabase
        .from('agent_memory')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('agent_name', agentName)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (memoriesError) throw memoriesError;

      // Calculate performance score based on XP
      const totalXp = memories?.reduce((sum, memory) => sum + (memory.xp_delta || 0), 0) || 0;
      const avgXp = memories?.length ? totalXp / memories.length : 0;

      // Update agent profile
      const { error: updateError } = await supabase
        .from('agent_profiles')
        .update({ 
          memory_score: Math.min(100, Math.max(0, Math.round(avgXp * 10))),
          last_memory_update: new Date().toISOString()
        })
        .eq('tenant_id', tenant.id)
        .eq('agent_name', agentName);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Error analyzing agent performance:', error);
      return false;
    } finally {
      setIsLearning(false);
    }
  };

  return {
    isLearning,
    analyzeAgentPerformance
  };
}
