
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTenant } from '@/hooks/useTenant';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { LoadingState } from '@/components/ui/loading-state';
import { AlertTriangle, Users, Trash } from 'lucide-react';
import { useWorkspaceManagement } from '@/hooks/useWorkspaceManagement';
import { useToast } from '@/hooks/use-toast';
import { ErrorState } from '@/components/ui/error-state';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function WorkspaceSettingsPage() {
  const { tenant, isLoading, error, refreshTenant } = useTenant();
  const { checkAccess } = useRoleAccess();
  const { updateWorkspace } = useWorkspaceManagement();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [nameError, setNameError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  // Check if user is admin when tenant loads
  React.useEffect(() => {
    if (tenant) {
      setWorkspaceName(tenant.name || '');
      
      const checkIsAdmin = async () => {
        const hasAccess = await checkAccess('admin');
        setIsAdmin(hasAccess);
      };
      
      checkIsAdmin();
    }
  }, [tenant, checkAccess]);
  
  const handleUpdateName = async () => {
    if (!workspaceName.trim()) {
      setNameError('Workspace name cannot be empty');
      return;
    }
    
    if (!tenant) return;
    
    setIsUpdating(true);
    try {
      await updateWorkspace(tenant.id, { name: workspaceName });
      await refreshTenant();
      
      toast({
        title: "Workspace updated",
        description: "The workspace name has been updated successfully."
      });
      
      setNameError('');
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update workspace name",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading workspace..." />;
  }
  
  if (error || !tenant) {
    return <ErrorState title="Workspace Error" error={error || "No workspace selected"} />;
  }
  
  if (!isAdmin) {
    return (
      <Alert className="max-w-lg mx-auto mt-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Restricted</AlertTitle>
        <AlertDescription>
          You need administrator permissions to view this page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Workspace Settings</h1>
        <Button asChild variant="outline">
          <Link to="/workspace">
            Back to Workspaces
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Manage your workspace details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <div className="flex gap-2">
              <Input 
                id="name" 
                value={workspaceName} 
                onChange={(e) => setWorkspaceName(e.target.value)}
                className={`flex-1 ${nameError ? 'border-destructive' : ''}`}
              />
              <Button 
                onClick={handleUpdateName} 
                disabled={isUpdating || workspaceName === tenant.name}
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </Button>
            </div>
            {nameError && <p className="text-sm text-destructive">{nameError}</p>}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage users and permissions in this workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild>
            <Link to="/workspace/users">
              <Users className="mr-2 h-4 w-4" />
              Manage Team Members
            </Link>
          </Button>
        </CardContent>
      </Card>
      
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect this workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Workspace</DialogTitle>
                <DialogDescription>
                  This action is irreversible. All data, including projects, settings, and configurations, will be permanently deleted.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="confirm">Type <strong>{tenant.name}</strong> to confirm deletion</Label>
                <Input 
                  id="confirm" 
                  value={deleteConfirmation} 
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleteConfirmation !== tenant.name}
                >
                  I understand, delete this workspace
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
