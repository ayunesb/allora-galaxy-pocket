
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AgentStat {
  agent: string;
  date: string;
  xp: number;
  success: number;
  failed: number;
  prompt_version?: number; // Added for version tracking
  total?: number;          // Added for total count
}

export function useAgentStats() {
  const [stats, setStats] = useState<AgentStat[]>([]);
  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from("agent_tasks")
        .select("agent, status, executed_at, prompt_version");

      if (!data) {
        setStats([]);
        return;
      }

      const grouped = data.reduce((acc: Record<string, any>, task: any) => {
        const date = new Date(task.executed_at).toLocaleDateString();
        const version = task.prompt_version || 0;
        const key = `${task.agent}-${date}-${version}`;
        
        if (!acc[key]) {
          acc[key] = { 
            agent: task.agent, 
            date, 
            xp: 0, 
            success: 0, 
            failed: 0,
            prompt_version: version,
            total: 0
          };
        }
        
        acc[key].xp += 1;
        acc[key].total += 1;
        if (task.status === "success") acc[key].success += 1;
        if (task.status === "failed") acc[key].failed += 1;
        
        return acc;
      }, {});
      
      setStats(Object.values(grouped));
    };

    fetchStats();
  }, []);
  return stats;
}

