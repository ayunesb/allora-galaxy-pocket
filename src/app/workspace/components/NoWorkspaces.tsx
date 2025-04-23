
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, AlertCircle, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface NoWorkspacesProps {
  isCreating: boolean;
  creationError: string | null;
  onCreateWorkspace: () => void;
  onRefresh: () => void;
  userExists: boolean;
}

export const NoWorkspaces: React.FC<NoWorkspacesProps> = ({
  isCreating,
  creationError,
  onCreateWorkspace,
  onRefresh,
  userExists
}) => {
  if (!userExists) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertTitle>Authentication required</AlertTitle>
        <AlertDescription>
          Please sign in to access or create workspaces.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full mt-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">No workspaces found</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <p className="text-sm text-muted-foreground">
          You don't have any workspaces yet. Create your first workspace to continue.
        </p>
        
        {creationError && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription className="text-xs">{creationError}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col gap-2">
          <Button 
            size="sm" 
            onClick={onCreateWorkspace}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Workspace
              </>
            )}
          </Button>
          
          <Button 
            size="sm"
            variant="outline" 
            onClick={onRefresh}
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
