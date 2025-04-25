
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import { CreateWorkspaceForm } from './components/CreateWorkspaceForm';
import { Button } from '@/components/ui/button';
import { ChevronRight, Settings, Users, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTenant } from '@/hooks/useTenant';
import { WorkspaceErrorBoundary } from './components/WorkspaceErrorBoundary';

export default function WorkspacePage() {
  const { tenant } = useTenant();
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Workspace Management</h1>
      
      <WorkspaceErrorBoundary>
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle>Select Workspace</CardTitle>
              <CardDescription>
                Switch between available workspaces or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <WorkspaceSwitcher />
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle>Create New Workspace</CardTitle>
              <CardDescription>
                Create a new workspace for your team or project
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <CreateWorkspaceForm />
            </CardContent>
          </Card>
        </div>
        
        {tenant && (
          <Card>
            <CardHeader>
              <CardTitle>Current Workspace: {tenant.name}</CardTitle>
              <CardDescription>
                Manage your current workspace settings and users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Link to="/workspace/users" className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">Workspace Users</h3>
                    <p className="text-sm text-muted-foreground">Manage team access</p>
                  </div>
                </Link>
                
                <Link to="/workspace/environment" className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <Building className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">Environment</h3>
                    <p className="text-sm text-muted-foreground">Configure workspace environment</p>
                  </div>
                </Link>
                
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Settings className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">Workspace Settings</h3>
                    <p className="text-sm text-muted-foreground">Configure workspace preferences</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link to="/workspace/environment" className="flex items-center justify-center">
                  Manage Workspace Environment
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </WorkspaceErrorBoundary>
    </div>
  );
}
