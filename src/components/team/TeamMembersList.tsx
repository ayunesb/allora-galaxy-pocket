
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { UserRole } from "@/types/invite";

export function TeamMembersList() {
  const { 
    teamMembers, 
    isLoadingMembers, 
    updateRole, 
    removeMember 
  } = useTeamManagement();

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'editor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoadingMembers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div 
              key={member.id} 
              className="flex items-center justify-between p-2 border rounded"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {member.profiles.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                  {member.profiles.avatar_url && (
                    <AvatarImage src={member.profiles.avatar_url} />
                  )}
                </Avatar>
                <div>
                  <div>{member.profiles.email}</div>
                  <Badge variant={getRoleBadgeVariant(member.role)}>
                    {member.role}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => updateRole(member.user_id, 'admin' as UserRole)}
                    disabled={member.role === 'admin'}
                  >
                    Make Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => updateRole(member.user_id, 'editor' as UserRole)}
                    disabled={member.role === 'editor'}
                  >
                    Make Editor
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => updateRole(member.user_id, 'viewer' as UserRole)}
                    disabled={member.role === 'viewer'}
                  >
                    Make Viewer
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => removeMember(member.user_id)}
                  >
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
