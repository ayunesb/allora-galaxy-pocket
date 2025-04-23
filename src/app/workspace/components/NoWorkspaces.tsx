
import { AlertCircle, Loader2, PlusCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoWorkspacesProps {
  isCreating: boolean;
  creationError: string | null;
  onCreateWorkspace: () => void;
  onRefresh: () => void;
  userExists: boolean;
}

export const NoWorkspaces = ({ 
  isCreating, 
  creationError, 
  onCreateWorkspace, 
  onRefresh,
  userExists 
}: NoWorkspacesProps) => {
  return (
    <div className="space-y-3 px-2">
      <div className="px-2 text-muted-foreground text-sm">
        No workspaces found. Create your first workspace to continue.
      </div>
      {creationError && (
        <div className="text-red-500 py-2 px-2 text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {creationError}
        </div>
      )}
      <Button
        size="sm"
        className="w-full"
        onClick={onCreateWorkspace}
        disabled={isCreating || !userExists}
      >
        {isCreating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating workspace...
          </>
        ) : (
          <>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Workspace
          </>
        )}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={onRefresh}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh Page
      </Button>
    </div>
  );
};
