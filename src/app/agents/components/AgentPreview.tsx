
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { type AgentProfile } from "../hooks/useAgentProfile";
import { MemoryScoreIndicator } from "./MemoryScoreIndicator";

interface AgentPreviewProps {
  agent: AgentProfile;
}

export default function AgentPreview({ agent }: AgentPreviewProps) {
  const initials = agent.agent_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24">
        {agent.avatar_url ? (
          <AvatarImage src={agent.avatar_url} alt={agent.agent_name} />
        ) : (
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        )}
      </Avatar>

      <div className="text-center">
        <h3 className="text-xl font-semibold">{agent.agent_name}</h3>
        <p className="text-sm text-muted-foreground">{agent.role}</p>
      </div>

      {agent.memory_score !== undefined && (
        <MemoryScoreIndicator 
          score={agent.memory_score}
          lastUpdate={agent.last_memory_update}
          className="mt-4"
        />
      )}

      <div className="w-full space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Tone:</span>
          <span className="text-sm text-muted-foreground">{agent.tone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Language:</span>
          <span className="text-sm text-muted-foreground">{agent.language}</span>
        </div>
        {agent.model_provider && (
          <div className="flex justify-between">
            <span className="text-sm font-medium">Model:</span>
            <span className="text-sm text-muted-foreground">
              {agent.model_provider.charAt(0).toUpperCase() + agent.model_provider.slice(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
