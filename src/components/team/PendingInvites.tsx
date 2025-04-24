
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { RoleLabel } from "@/components/RoleLabel";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export function PendingInvites() {
  const { pendingInvites, isLoadingInvites } = useTeamManagement();

  if (isLoadingInvites) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!pendingInvites?.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingInvites.map((invite) => (
            <div key={invite.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <div>{invite.email}</div>
                <RoleLabel role={invite.role} />
              </div>
              <div className="text-sm text-muted-foreground">
                Expires {format(new Date(invite.expires_at), 'PP')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
