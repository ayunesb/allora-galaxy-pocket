
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import AdminOnly from '@/guards/AdminOnly';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserRole } from '@/hooks/useUserRole';

type User = {
  id: string;
  email: string;
  created_at: string;
  role?: string;
  last_sign_in_at?: string;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { role } = useUserRole();
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Get all users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, created_at');
      
      if (profilesError) throw profilesError;

      // Get user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;
      
      // Combine data
      const usersWithRoles = profiles.map(user => {
        const userRole = roles.find(r => r.user_id === user.id);
        return {
          ...user,
          role: userRole?.role || 'client'
        };
      });
      
      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <AdminOnly>
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">User Management</h1>
            <div>
              <Button asChild variant="outline" className="mr-2">
                <Link to="/admin/invite">Invite Users</Link>
              </Button>
              <Button asChild>
                <Link to="/admin/users/role-requests">Role Requests</Link>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="admins">Admins</TabsTrigger>
              <TabsTrigger value="developers">Developers</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 animate-pulse rounded"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">Email</th>
                            <th className="text-left py-3 px-2">Role</th>
                            <th className="text-left py-3 px-2">Created</th>
                            <th className="text-left py-3 px-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="py-3 px-2">{user.email}</td>
                              <td className="py-3 px-2">
                                <Badge variant={
                                  user.role === 'admin' ? 'destructive' :
                                  user.role === 'developer' ? 'default' : 'outline'
                                }>
                                  {user.role}
                                </Badge>
                              </td>
                              <td className="py-3 px-2">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-2">
                                <Button size="sm" variant="outline" asChild>
                                  <Link to={`/admin/users/${user.id}`}>View</Link>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {['admins', 'developers', 'clients'].map((userType) => (
              <TabsContent key={userType} value={userType}>
                <Card>
                  <CardHeader>
                    <CardTitle>{userType.charAt(0).toUpperCase() + userType.slice(1)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">Email</th>
                            <th className="text-left py-3 px-2">Created</th>
                            <th className="text-left py-3 px-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users
                            .filter(user => {
                              // Remove 's' from the end of the tab name to match role name
                              const roleToMatch = userType.endsWith('s') 
                                ? userType.slice(0, -1) 
                                : userType;
                              return user.role === roleToMatch;
                            })
                            .map((user) => (
                              <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="py-3 px-2">{user.email}</td>
                                <td className="py-3 px-2">
                                  {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-2">
                                  <Button size="sm" variant="outline" asChild>
                                    <Link to={`/admin/users/${user.id}`}>View</Link>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </AdminOnly>
    </ErrorBoundary>
  );
}
