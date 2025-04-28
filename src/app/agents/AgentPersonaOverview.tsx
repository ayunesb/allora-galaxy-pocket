
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentProfile } from "@/types/agent";

interface AgentPersonaOverviewProps {
  agent: AgentProfile | null;
}

export default function AgentPersonaOverview({ agent }: AgentPersonaOverviewProps) {
  if (!agent) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No agent selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Persona</h3>
          <p className="text-muted-foreground">{agent.tone}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Role</h3>
          <p className="text-muted-foreground">{agent.role}</p>
        </div>

        {agent.channels && agent.channels.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Channels</h3>
            <div className="flex flex-wrap gap-2">
              {agent.channels.map((channel) => (
                <Badge key={channel} variant="outline">
                  {channel}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
