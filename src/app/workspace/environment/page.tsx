
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTenant } from '@/hooks/useTenant';
import { Button } from '@/components/ui/button';
import { Shield, Users, Database, Settings, RefreshCw } from 'lucide-react';
import { useAvailableTenants } from '../hooks/useAvailableTenants';
import { WorkspaceErrorBoundary } from '../components/WorkspaceErrorBoundary';
import { useUserRole } from '@/hooks/useUserRole';

export default function WorkspaceEnvironmentPage() {
  const { tenant } = useTenant();
  const { role } = useUserRole();
  const { retryFetch } = useAvailableTenants();
  
  const isAdmin = role === 'admin';
  
  if (!tenant) {
    return (
      <Card className="my-6 p-6">
        <CardHeader className="pb-3">
          <CardTitle>No Workspace Selected</CardTitle>
          <CardDescription>
            Please select a workspace to view environment details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <a href="/workspace">Select Workspace</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{tenant.name}</h1>
          <p className="text-muted-foreground">Workspace Environment Management</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => retryFetch()} 
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <WorkspaceErrorBoundary>
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            {isAdmin && <TabsTrigger value="settings">Settings</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workspace Details</CardTitle>
                  <CardDescription>General information about this workspace</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">ID</dt>
                      <dd className="mt-1 text-sm">{tenant.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                      <dd className="mt-1 text-sm">{tenant.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Theme</dt>
                      <dd className="mt-1 text-sm capitalize">{tenant.theme_color} / {tenant.theme_mode}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Auto-Approve</dt>
                      <dd className="mt-1 text-sm">{tenant.enable_auto_approve ? 'Enabled' : 'Disabled'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Demo Workspace</dt>
                      <dd className="mt-1 text-sm">{tenant.isDemo ? 'Yes' : 'No'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Security Status</CardTitle>
                  <CardDescription>RLS policy protection status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">Tenant isolation active</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    This workspace is protected by Row-Level Security policies that ensure
                    data cannot be accessed by users from other workspaces.
                  </p>
                  {isAdmin && (
                    <Button variant="outline" size="sm" asChild>
                      <a href="/admin/security-audit">Security Audit</a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Workspace Users</CardTitle>
                  <CardDescription>Manage user access to this workspace</CardDescription>
                </div>
                {isAdmin && (
                  <Button size="sm" className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Invite User
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This feature will be implemented in a future phase.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Workspace Data</CardTitle>
                <CardDescription>Manage data in this workspace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">Multi-tenant data isolation</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Data in this workspace is isolated from other workspaces using 
                  Row-Level Security policies to ensure privacy and security.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Workspace Settings</CardTitle>
                  <CardDescription>Configure workspace settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium">Admin Settings</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Advanced settings for this workspace will be available in a future update.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </WorkspaceErrorBoundary>
    </div>
  );
}
