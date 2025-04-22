
import React from "react";
import { AgentProfile } from "./hooks/useAgentProfile";
import { Star } from "lucide-react";

export default function AgentSkillMatrix({ agent }: { agent: AgentProfile | null }) {
  if (!agent) return (
    <div className="text-muted-foreground text-center py-4">
      No agent data for skills matrix.
    </div>
  );
  // For now just show enabled tools as specializations
  return (
    <div>
      <div className="font-semibold mb-1">Specializations:</div>
      <div className="flex flex-wrap gap-3">
        {(agent.enabled_tools && agent.enabled_tools.length > 0) ? (
          agent.enabled_tools.map((tool: string) => (
            <span key={tool} className="inline-flex items-center bg-accent px-3 py-1 rounded text-xs font-medium">
              <Star size={14} className="mr-1 text-yellow-500" />
              {tool}
            </span>
          ))
        ) : (
          <span className="text-muted-foreground">No specializations specified.</span>
        )}
      </div>
    </div>
  );
}
