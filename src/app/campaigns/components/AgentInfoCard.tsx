
import { useAgentContext } from "@/contexts/AgentContext";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

export function AgentInfoCard() {
  const { agentProfile, isLoading } = useAgentContext();

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">Loading agent info...</span>
        </CardContent>
      </Card>
    );
  }

  if (!agentProfile) {
    return null;
  }

  // Create initials from agent name for the avatar fallback
  const initials = agentProfile.agent_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  // Get channels as a string
  const channels = agentProfile.channels && agentProfile.channels.length > 0
    ? agentProfile.channels.join(", ")
    : "All channels";

  return (
    <Card className="mb-4 border-l-4 border-l-primary">
      <CardContent className="flex items-center p-4">
        <Avatar className="h-10 w-10 mr-3">
          {agentProfile.avatar_url ? (
            <AvatarImage src={agentProfile.avatar_url} alt={agentProfile.agent_name} />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>
        <div className="space-y-1">
          <div className="font-medium leading-none flex items-center">
            <span className="mr-1">Agent:</span> {agentProfile.agent_name}
          </div>
          <div className="text-xs text-muted-foreground flex flex-col sm:flex-row sm:gap-2">
            <span>{agentProfile.role}</span>
            <span className="hidden sm:block">•</span>
            <span>{agentProfile.tone} tone</span>
            <span className="hidden sm:block">•</span>
            <span>{channels}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
