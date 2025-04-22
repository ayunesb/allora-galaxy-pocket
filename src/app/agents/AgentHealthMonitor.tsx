
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AgentProfile } from "./hooks/useAgentProfile";

/**
 * Shows live metrics: task count, success %, XP and last run for this agent.
 */
export default function AgentHealthMonitor({ agent }: { agent: AgentProfile | null }) {
  const agentName = agent?.agent_name || "";

  const { data: stats, isLoading } = useQuery({
    queryKey: ["agent-tasks-summary", agentName],
    queryFn: async () => {
      if (!agentName) return null;
      const { data, error } = await supabase
        .from("agent_tasks")
        .select("status, executed_at")
        .eq("agent", agentName);

      if (error || !data) return null;

      const success = data.filter((t) => t.status === "success").length;
      const failed = data.filter((t) => t.status === "failed").length;
      const total = data.length;
      const lastRun =
        data.length > 0
          ? data
              .filter((t) => !!t.executed_at)
              .sort((a, b) => b.executed_at.localeCompare(a.executed_at))[0]?.executed_at
          : undefined;
      return { success, failed, total, lastRun };
    },
    enabled: !!agentName,
  });

  if (!agent) {
    return (
      <div className="text-muted-foreground text-center py-4">
        No agent available for health monitoring.
      </div>
    );
  }

  if (isLoading || !stats) {
    return (
      <div className="text-muted-foreground text-center py-4">
        Loading health metrics...
      </div>
    );
  }

  const { success, failed, total, lastRun } = stats;
  const healthScore = total > 0 ? Math.round((success / total) * 100) : 0;
  const xp = total;
  const badge = xp > 50 ? "🔥 Pro" : xp > 20 ? "⭐ Skilled" : "🟢 Rookie";

  return (
    <div className="border rounded p-4 bg-background shadow space-y-2">
      <h2 className="text-lg font-semibold">🩺 {agentName} Health Summary</h2>
      <p className="text-sm">🟢 Tasks run: {total}</p>
      <p className="text-sm text-green-600">✅ Successes: {success}</p>
      <p className="text-sm text-red-600">❌ Fails: {failed}</p>
      <p className="text-sm">
        📊 Health Score: <strong>{healthScore}%</strong>
      </p>
      <p className="text-sm">
        🏅 XP: {xp} — {badge}
      </p>
      <p className="text-xs text-muted-foreground">
        Last run: {lastRun ? new Date(lastRun).toLocaleString() : "N/A"}
      </p>
    </div>
  );
}
