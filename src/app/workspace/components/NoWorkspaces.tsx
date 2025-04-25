
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface NoWorkspacesProps {
  isCreating: boolean;
  creationError: string | null;
  onCreateWorkspace: () => Promise<void>;
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
    <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-md text-center">
      <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
      <h3 className="text-lg font-medium mb-2">No Workspaces Found</h3>
      
      {userExists ? (
        <p className="text-sm text-muted-foreground mb-4">
          You don't have any workspaces yet. Create your first workspace to get started.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground mb-4">
          Please sign in to view or create workspaces.
        </p>
      )}
      
      {creationError && (
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-sm text-red-600 dark:text-red-400 mb-4 w-full">
          {creationError}
        </div>
      )}
      
      <div className="space-y-2 w-full">
        {userExists && (
          <Button 
            onClick={onCreateWorkspace} 
            disabled={isCreating} 
            className="w-full"
          >
            {isCreating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Default Workspace
              </>
            )}
          </Button>
        )}
        
        <Button 
          onClick={onRefresh}
          variant="outline"
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
