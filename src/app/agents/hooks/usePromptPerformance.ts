
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PromptPerformanceData } from "@/types/agent";

export function usePromptPerformance(agentName: string) {
  return useQuery({
    queryKey: ["prompt-performance", agentName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_prompt_versions")
        .select("version, prompt")
        .eq("agent_name", agentName)
        .order("version", { ascending: false });
        
      if (error) throw error;
      
      // Calculate performance metrics for each version
      const performanceData: PromptPerformanceData[] = await Promise.all(
        data.map(async (version) => {
          const { data: feedback } = await supabase
            .from("agent_feedback")
            .select("rating")
            .eq("agent_name", agentName)
            .eq("type", "prompt_feedback");
            
          const total = feedback?.length || 0;
          const success_count = feedback?.filter(f => f.rating >= 4).length || 0;
          
          return {
            agent: agentName,
            version: version.version,
            total,
            success_count,
            success_rate: total > 0 ? success_count / total : 0
          };
        })
      );
      
      return performanceData;
    }
  });
}

export const generatePromptRecommendations = (agentName: string, performanceData: PromptPerformanceData[]) => {
  if (performanceData.length < 2) return null;

  const current = performanceData[0];
  const previous = performanceData.slice(1).reduce((best, current) => 
    current.success_rate > best.success_rate ? current : best
  );

  const performance_delta = previous.success_rate - current.success_rate;

  if (performance_delta > 0.15) { // 15% worse than best performing version
    return {
      current_version: current.version,
      suggested_version: previous.version,
      performance_delta,
      message: `Version ${current.version} is underperforming compared to v${previous.version} by ${Math.round(performance_delta * 100)}%`
    };
  }

  return null;
};
