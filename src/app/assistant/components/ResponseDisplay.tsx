
import { Card } from "@/components/ui/card";
import { useAgentContext } from "@/contexts/AgentContext";

interface ResponseDisplayProps {
  response: string;
  isLoading: boolean;
}

export function ResponseDisplay({ response, isLoading }: ResponseDisplayProps) {
  const { agentProfile } = useAgentContext();
  
  if (!response) return null;

  return (
    <Card className="mt-4 p-4 bg-muted/50">
      {agentProfile && (
        <div className="text-xs text-muted-foreground mb-2">
          {agentProfile.agent_name} is responding:
        </div>
      )}
      <pre className="text-sm whitespace-pre-wrap font-mono">
        {isLoading ? (
          <span className="text-muted-foreground">Processing your request...</span>
        ) : (
          response
        )}
      </pre>
    </Card>
  );
}
