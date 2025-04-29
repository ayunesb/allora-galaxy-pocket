
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTenant } from '@/hooks/useTenant';
import { useTenantValidation } from '@/hooks/useTenantValidation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WorkspaceErrorBoundary } from '../components/WorkspaceErrorBoundary';
import { InviteUserModal } from './components/InviteUserModal';
import { PendingInvites } from './components/PendingInvites';
import { User, UserPlus, Trash2, ShieldCheck, Shield, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Directly specify the enum type with the same values as the database
type UserRoleType = 'owner' | 'admin' | 'member' | 'viewer';

type WorkspaceUser = {
  id: string;
  email: string;
  role: UserRoleType;
  created_at: string;
  last_sign_in?: string;
}

export default function WorkspaceUsersPage() {
  const { tenant } = useTenant();
  const { isValidating, isValid } = useTenantValidation();
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('members');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const fetchUsers = async () => {
    if (!tenant) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tenant_user_roles')
        .select(`
          user_id,
          role,
          created_at,
          users:user_id (
            id,
            email,
            last_sign_in_at
          )
        `)
        .eq('tenant_id', tenant.id);
      
      if (error) throw error;
      
      const formattedUsers = data.map(item => ({
        id: item.user_id,
        email: item.users ? (item.users as any).email || 'No email' : 'No email',
        role: item.role as UserRoleType,
        created_at: item.created_at,
        last_sign_in: item.users ? (item.users as any).last_sign_in_at : undefined,
      }));
      
      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Error fetching workspace users:', error);
      toast.error('Failed to load workspace users');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (tenant && isValid) {
      fetchUsers();
    }
  }, [tenant, isValid]);
  
  const handleRoleChange = async (userId: string, newRole: UserRoleType) => {
    if (!tenant) return;
    
    try {
      const { error } = await supabase
        .from('tenant_user_roles')
        .update({ role: newRole })
        .eq('tenant_id', tenant.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast.success('Role updated successfully');
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
    } catch (error: any) {
      toast.error('Failed to update user role');
    }
  };
  
  const openRemoveDialog = (userId: string) => {
    setSelectedUserId(userId);
    setIsRemoveDialogOpen(true);
  };
  
  const handleRemoveUser = async () => {
    if (!tenant || !selectedUserId) return;
    
    try {
      const { error } = await supabase
        .from('tenant_user_roles')
        .delete()
        .eq('tenant_id', tenant.id)
        .eq('user_id', selectedUserId);
      
      if (error) throw error;
      
      toast.success('User has been removed from the workspace');
      
      setUsers(users.filter(user => user.id !== selectedUserId));
      setIsRemoveDialogOpen(false);
      setSelectedUserId(null);
      
    } catch (error: any) {
      toast.error('Failed to remove user');
    }
  };
  
  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return <Badge className="bg-primary">Owner</Badge>;
      case 'admin':
        return <Badge className="bg-purple-600">Admin</Badge>;
      case 'member':
        return <Badge>Member</Badge>;
      case 'viewer':
        return <Badge variant="outline">Viewer</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };
  
  if (isValidating || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!tenant) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Workspace Selected</CardTitle>
          <CardDescription>Please select a workspace first</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <WorkspaceErrorBoundary>
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Workspace Users</h1>
          <Button className="flex items-center gap-2" onClick={() => setIsInviteModalOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Invite User
          </Button>
        </div>
        
        <InviteUserModal 
          isOpen={isInviteModalOpen} 
          onClose={() => setIsInviteModalOpen(false)}
          onInviteSuccess={fetchUsers}
        />
        
        <AlertDialog 
          open={isRemoveDialogOpen} 
          onOpenChange={setIsRemoveDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove user?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the user from this workspace. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleRemoveUser}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <Card>
          <Tabs defaultValue="members" value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle>Users for {tenant?.name}</CardTitle>
                <TabsList>
                  <TabsTrigger value="members">
                    <User className="h-4 w-4 mr-2" />
                    Members
                  </TabsTrigger>
                  <TabsTrigger value="invites">Pending Invites</TabsTrigger>
                  <TabsTrigger value="permissions">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Permissions
                  </TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>
                Manage users who have access to this workspace
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              <TabsContent value="members" className="m-0">
                <div className="flex justify-end mb-4">
                  <Button variant="outline" size="sm" onClick={fetchUsers}>
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Refresh
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {getRoleBadge(user.role)}
                          </TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {user.last_sign_in 
                              ? new Date(user.last_sign_in).toLocaleDateString() 
                              : 'Never'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Select
                                defaultValue={user.role}
                                onValueChange={(value) => handleRoleChange(user.id, value as UserRoleType)}
                              >
                                <SelectTrigger className="w-[100px] h-8">
                                  <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="owner">Owner</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                size="icon"
                                variant="outline" 
                                className="h-8 w-8 text-red-500"
                                onClick={() => openRemoveDialog(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No users found for this workspace
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="invites" className="m-0">
                <PendingInvites />
              </TabsContent>
              
              <TabsContent value="permissions" className="m-0">
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-md">
                    <h3 className="font-medium mb-1">Owner</h3>
                    <p className="text-sm text-muted-foreground">
                      Can manage all aspects of the workspace, including billing, users, and settings.
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-md">
                    <h3 className="font-medium mb-1">Admin</h3>
                    <p className="text-sm text-muted-foreground">
                      Can manage users and content, but cannot manage billing or delete the workspace.
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-md">
                    <h3 className="font-medium mb-1">Member</h3>
                    <p className="text-sm text-muted-foreground">
                      Can create and edit content, but cannot manage users or workspace settings.
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-md">
                    <h3 className="font-medium mb-1">Viewer</h3>
                    <p className="text-sm text-muted-foreground">
                      Can view content but cannot make any changes.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </WorkspaceErrorBoundary>
  );
}
