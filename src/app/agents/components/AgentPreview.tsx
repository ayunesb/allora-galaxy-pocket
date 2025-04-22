import { AgentProfile } from "@/app/agents/hooks/useAgentProfile";
import { ScriptDialog } from "@/components/ScriptDialog";

interface AgentPreviewProps {
  agent: AgentProfile | null;
}

export default function AgentPreview({ agent }: AgentPreviewProps) {
  if (!agent) return null;

  const intro = `Hello! I am ${agent.agent_name}, an AI agent skilled in ${agent.role}. My tone is ${agent.tone}.`;
  const conversation = (
    <div>
      <b>User:</b> "How do you help startups?"<br />
      <b>{agent.agent_name}:</b> {`I use my ${agent.role} skills to help your team succeed!`}
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="text-lg font-semibold">{agent.agent_name}</div>
        <ScriptDialog script={intro} testConversation={conversation} variant="ghost" buttonSize="sm" />
      </div>
      <div className="text-muted-foreground mb-1">{agent.role}</div>
      <div className="text-sm">{agent.tone}</div>
    </div>
  );
}
