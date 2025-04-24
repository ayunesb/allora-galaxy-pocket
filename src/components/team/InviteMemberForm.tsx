
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { UserRole } from "@/types/invite";

export function InviteMemberForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("viewer");
  const { inviteTeamMember } = useTeamManagement();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inviteTeamMember({ email, role });
    setEmail("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" className="w-full">
            Send Invite
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
