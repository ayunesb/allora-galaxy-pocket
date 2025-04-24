
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleLabel } from "@/components/RoleLabel";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { UserRole } from "@/types/invite";
import { Loader2 } from "lucide-react";

export function TeamMembersList() {
  const { 
    teamMembers, 
    isLoadingMembers,
    updateRole
  } = useTeamManagement();

  if (isLoadingMembers) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamMembers?.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <div>{member.profiles?.email}</div>
                <RoleLabel role={member.role} />
              </div>
              <Select
                value={member.role}
                onValueChange={(newRole) => {
                  updateRole({ 
                    userId: member.user_id, 
                    role: newRole as UserRole 
                  });
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
