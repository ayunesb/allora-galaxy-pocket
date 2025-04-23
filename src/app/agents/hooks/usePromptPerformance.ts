
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { PromptPerformanceData } from "@/types/agent";

export function usePromptPerformance(agentName: string) {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ["prompt-performance", agentName, tenant?.id],
    queryFn: async () => {
      if (!tenant?.id || !agentName) return [];

      const { data, error } = await supabase.rpc('get_prompt_performance', {
        p_agent_name: agentName,
        p_tenant_id: tenant.id
      }).catch(() => {
        // Fallback if the RPC doesn't exist - query directly
        return supabase
          .from("agent_tasks")
          .select("prompt_version, status")
          .eq("agent", agentName)
          .eq("tenant_id", tenant.id);
      });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Process the data to get performance metrics
      const performanceByVersion: Record<string, {
        version: number;
        total: number;
        success_count: number;
      }> = {};

      // Group and count by version
      data.forEach((task: any) => {
        const version = task.prompt_version || 0;
        if (!performanceByVersion[version]) {
          performanceByVersion[version] = { 
            version,
            total: 0,
            success_count: 0
          };
        }
        performanceByVersion[version].total += 1;
        if (task.status === 'success') {
          performanceByVersion[version].success_count += 1;
        }
      });

      // Calculate success rates and format results
      const results: PromptPerformanceData[] = Object.values(performanceByVersion).map(v => ({
        agent: agentName,
        version: v.version,
        total: v.total,
        success_count: v.success_count,
        success_rate: v.total > 0 ? v.success_count / v.total : 0
      }));

      return results;
    },
    enabled: !!tenant?.id && !!agentName,
  });
}

export function usePromptRecommendations() {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ["prompt-recommendations", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

      const { data, error } = await supabase
        .from("agent_alerts")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("alert_type", "prompt-switch-recommendation")
        .order("triggered_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });
}

export function generatePromptRecommendations(
  agentName: string,
  performanceData: PromptPerformanceData[]
) {
  if (!performanceData || performanceData.length < 2) return null;
  
  // Find the current version (assume highest version number is current)
  const currentVersion = Math.max(...performanceData.map(d => d.version));
  const currentVersionData = performanceData.find(d => d.version === currentVersion);
  
  if (!currentVersionData) return null;
  
  // Find the best performing version
  const bestPerformer = [...performanceData]
    .filter(d => d.total >= 5) // Minimum sample size
    .sort((a, b) => b.success_rate - a.success_rate)[0];
    
  if (!bestPerformer || bestPerformer.version === currentVersion) return null;
  
  // Only recommend if there's a significant difference (20%)
  const delta = bestPerformer.success_rate - currentVersionData.success_rate;
  if (delta >= 0.2) {
    return {
      agent: agentName,
      current_version: currentVersion,
      suggested_version: bestPerformer.version,
      performance_delta: delta,
      message: `Agent ${agentName} is underperforming. Try switching to v${bestPerformer.version}?`
    };
  }
  
  return null;
}
