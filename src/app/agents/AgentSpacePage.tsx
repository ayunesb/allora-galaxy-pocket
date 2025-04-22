
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { useTenant } from "@/hooks/useTenant";
import AgentProfileEditor from "./components/AgentProfileEditor";
import AgentPreview from "./components/AgentPreview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgentProfile } from "./hooks/useAgentProfile";

export default function AgentSpacePage() {
  const { isAdmin } = useRolePermissions();
  const { tenant } = useTenant();
  const { agent, isLoading } = useAgentProfile();

  if (isLoading) {
    return <div>Loading...</div>;
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
            ) : (
              <AgentPreview agent={agent} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
