
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { useTenant } from "@/hooks/useTenant";
import { Loader2 } from "lucide-react";
import AgentProfileEditor from "./components/AgentProfileEditor";
import AgentPreview from "./components/AgentPreview";
import { useAgentProfile } from "./hooks/useAgentProfile";

export default function AgentSpacePage() {
  const { isAdmin } = useRolePermissions();
  const { tenant } = useTenant();
  const { data: agent, isLoading } = useAgentProfile();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <p>Loading agent profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Agent Space</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Agent Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {isAdmin ? (
              <AgentProfileEditor initialData={agent} />
            ) : agent ? (
              <AgentPreview agent={agent} />
            ) : (
              <p className="text-center text-muted-foreground">
                No agent profile configured yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
