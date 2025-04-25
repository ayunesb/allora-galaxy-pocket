
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTenant } from '@/hooks/useTenant';
import { useTenantValidation } from '@/hooks/useTenantValidation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WorkspaceErrorBoundary } from '../components/WorkspaceErrorBoundary';
import { LoadingState } from '../components/LoadingState';
import { User, UserPlus, Trash2, ShieldCheck, Shield } from 'lucide-react';

type WorkspaceUser = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in?: string;
}

export default function WorkspaceUsersPage() {
  const { tenant } = useTenant();
  const { isValidating, isValid } = useTenantValidation();
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('members');
  
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
        email: item.users.email,
        role: item.role,
        created_at: item.created_at,
        last_sign_in: item.users.last_sign_in_at,
      }));
      
      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Error fetching workspace users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workspace users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (tenant && isValid) {
      fetchUsers();
    }
  }, [tenant, isValid]);
  
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
    return <LoadingState />;
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
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite User
          </Button>
        </div>
        
        <Card>
          <Tabs defaultValue="members" value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle>Users for {tenant.name}</CardTitle>
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
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {user.last_sign_in 
                              ? new Date(user.last_sign_in).toLocaleDateString() 
                              : 'Never'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                <Shield className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-500">
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
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground">No pending invites</p>
                </div>
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
