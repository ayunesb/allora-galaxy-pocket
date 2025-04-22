
import React from "react";
import { AgentProfile } from "./hooks/useAgentProfile";
import { Activity, TrendingUp } from "lucide-react";

/**
 * For now, this is a stub—expand with system and performance metrics later.
 */
export default function AgentHealthMonitor({ agent }: { agent: AgentProfile | null }) {
  if (!agent) return (
    <div className="text-muted-foreground text-center py-4">
      No agent available for health monitoring.
    </div>
  );
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 font-semibold">
        <Activity size={18} className="text-green-600" />
        Uptime/Self-Check: <span className="font-mono text-xs text-muted-foreground">Healthy</span>
      </div>
      <div className="flex items-center gap-2 font-medium">
        <TrendingUp size={16} className="text-blue-500" />
        Memory Score: <span className="font-mono text-xs">{agent.memory_score ?? "N/A"}</span>
      </div>
      {/* Later: show more metrics, agent alerts, incident logs, etc */}
    </div>
  );
}
