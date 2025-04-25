
import React from 'react';
import { AlertTriangle, Plus, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface NoWorkspacesProps {
  isCreating: boolean;
  creationError: string | null;
  onCreateWorkspace: () => void;
  onRefresh: () => void;
  userExists: boolean;
}

export function NoWorkspaces({
  isCreating,
  creationError,
  onCreateWorkspace,
  onRefresh,
  userExists
}: NoWorkspacesProps) {
  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>No workspaces found</AlertTitle>
      <AlertDescription className="mt-2">
        {creationError ? (
          <p className="text-red-500 mb-2">{creationError}</p>
        ) : (
          <p className="mb-2">Create your first workspace to get started.</p>
        )}
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onCreateWorkspace}
            disabled={isCreating || !userExists}
          >
            <Plus className="h-4 w-4 mr-1" />
            {isCreating ? "Creating..." : "Create Workspace"}
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
