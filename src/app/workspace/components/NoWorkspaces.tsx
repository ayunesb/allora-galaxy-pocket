
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    <Card>
      <CardHeader>
        <CardTitle>Welcome to Allora OS</CardTitle>
        <CardDescription>
          {userExists 
            ? "You don't have access to any workspaces yet." 
            : "Please sign in to access your workspaces."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {creationError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{creationError}</AlertDescription>
          </Alert>
        )}
        
        {userExists && (
          <div className="flex space-x-2">
            <Button 
              onClick={onCreateWorkspace} 
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create New Workspace'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={onRefresh}
              disabled={isCreating}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
