
import React from 'react';
import AdminOnly from '@/guards/AdminOnly';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { UserRole } from '@/types/invite';
import { toast } from 'sonner';

export default function UserManagementPage() {
  const { 
    teamMembers, 
    isLoadingMembers, 
    updateMemberRole 
  } = useTeamManagement();
  
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const filteredMembers = React.useMemo(() => {
    if (!teamMembers) return [];
    
    return teamMembers.filter(member => 
      member?.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [teamMembers, searchQuery]);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateMemberRole({ userId, role: newRole });
  };
  
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'warning';
      case 'editor':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <AdminOnly>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Team Members</h2>
            <div className="w-1/3">
              <Input
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>

          {isLoadingMembers ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredMembers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.profiles?.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(member.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        defaultValue={member.role}
                        onValueChange={(value) => handleRoleChange(member.user_id, value as UserRole)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Change role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No team members found matching your search.
            </div>
          )}
        </Card>
      </div>
    </AdminOnly>
  );
}
