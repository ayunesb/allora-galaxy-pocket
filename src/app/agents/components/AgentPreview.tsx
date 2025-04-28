
import { AgentProfile } from "@/types/agent";
import { ScriptDialog } from "@/components/ScriptDialog";

interface AgentPreviewProps {
  agent: AgentProfile | null;
}

export default function AgentPreview({ agent }: AgentPreviewProps) {
  if (!agent) return null;

  // Prepare agent description and capabilities for dialog
  const description = agent.tone
    ? `Description: ${agent.agent_name} operates with a "${agent.tone}" approach.`
    : `Description: ${agent.agent_name}.`;

  const capabilities =
    agent.enabled_tools && agent.enabled_tools.length > 0
      ? `Capabilities: ${agent.enabled_tools.join(", ")}.`
      : "Capabilities: Not specified.";

  const channels =
    agent.channels && agent.channels.length > 0
      ? `Preferred Channels: ${agent.channels.join(", ")}.`
      : "Preferred Channels: All channels.";

  const position = `Role/Position: ${agent.role}${agent.language ? ` (${agent.language})` : ""}.`;

  const experience = agent.memory_score
    ? `Experience Score: ${agent.memory_score}${agent.memory_score >= 9000 ? " (Legendary knowledge!)" : ""}`
    : "Experience: Not specified.";

  // Compose full agent profile script for the dialog
  const fullAgentProfile = [
    `Agent: ${agent.agent_name}`,
    description,
    capabilities,
    channels,
    position,
    experience,
  ].join("\n");

  // Test conversation: Explain how the agent will help
  const testConversation = (
    <div>
      <b>User:</b> "What can you do for me as {agent.agent_name}?"<br />
      <b>{agent.agent_name}:</b>{" "}
      {`As your ${agent.role}, I use my strengths${
        agent.enabled_tools && agent.enabled_tools.length > 0
          ? " (like: " + agent.enabled_tools.join(", ") + ")"
          : ""
      } to guide your team. My approach is "${agent.tone}", ensuring your goals are achieved efficiently on ${agent.channels && agent.channels.length > 0 ? agent.channels.join(", ") : "any channel"}.`}
      <br />
      <b>User:</b> "How do you approach your tasks?"<br />
      <b>{agent.agent_name}:</b> {`I leverage my experience${agent.memory_score ? " (score: " + agent.memory_score + ")" : ""} to adapt my strategies, provide insights, and make sure you reach success in your role.`}
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="text-lg font-semibold">{agent.agent_name}</div>
        <ScriptDialog
          label="View"
          script={fullAgentProfile}
          testConversation={testConversation}
          variant="ghost"
          buttonSize="sm"
        />
      </div>
      <div className="text-muted-foreground mb-1">{agent.role}</div>
      <div className="text-sm">{agent.tone}</div>
    </div>
  );
}
