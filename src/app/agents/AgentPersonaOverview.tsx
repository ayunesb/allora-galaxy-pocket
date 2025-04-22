
import React from "react";
import { AgentProfile } from "./hooks/useAgentProfile";
import { MessageSquare } from "lucide-react";

/**
 * Expanded, readable summary of agent core details and capabilities.
 */
export default function AgentPersonaOverview({ agent }: { agent: AgentProfile | null }) {
  if (!agent) return (
    <div className="text-muted-foreground text-center py-6">No agent profile configured yet.</div>
  );

  // Core attributes
  const description = agent.tone
    ? `${agent.agent_name} operates with a "${agent.tone}" approach.`
    : agent.agent_name;

  const capabilities =
    agent.enabled_tools && agent.enabled_tools.length > 0
      ? agent.enabled_tools.join(", ")
      : "Not specified";

  const channels =
    agent.channels && agent.channels.length > 0
      ? agent.channels.join(", ")
      : "All channels";

  const position = agent.language
    ? `${agent.role} (${agent.language})`
    : agent.role;

  const experience =
    typeof agent.memory_score === "number"
      ? `${agent.memory_score}${agent.memory_score >= 9000 ? " (Legendary knowledge!)" : "" }`
      : "Not specified";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <MessageSquare size={24} className="text-primary" />
        <div>
          <div className="text-xl font-bold">{agent.agent_name}</div>
          <div className="text-sm text-muted-foreground">{position}</div>
        </div>
      </div>
      <div>
        <span className="font-semibold">Description:</span> {description}
      </div>
      <div>
        <span className="font-semibold">Capabilities:</span> {capabilities}
      </div>
      <div>
        <span className="font-semibold">Preferred Channels:</span> {channels}
      </div>
      <div>
        <span className="font-semibold">Experience:</span> {experience}
      </div>
    </div>
  );
}
