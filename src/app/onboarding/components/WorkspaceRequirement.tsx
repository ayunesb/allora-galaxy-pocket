
import React from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import LiveSystemVerification from "@/components/LiveSystemVerification";
import { ArrowRight, RefreshCw } from "lucide-react";
import WorkspaceSwitcher from "@/app/workspace/WorkspaceSwitcher";

interface WorkspaceRequirementProps {
  workspaceError: boolean;
  onContinue: () => void;
}

export function WorkspaceRequirement({ workspaceError, onContinue }: WorkspaceRequirementProps) {
  return (
    <Card className="w-full max-w-2xl p-6 space-y-6 bg-card dark:bg-gray-800 border border-border dark:border-gray-700 relative">
      <LiveSystemVerification />
      <Alert variant="destructive">
        <AlertTitle>No workspace selected</AlertTitle>
        <AlertDescription>
          Please select or create a workspace before continuing with onboarding.
        </AlertDescription>
      </Alert>
      
      <div className="p-4 border rounded-md bg-muted/50">
        <h3 className="text-lg font-medium mb-3">Select a workspace to continue</h3>
        <WorkspaceSwitcher highlight={true} />
        
        {workspaceError && (
          <p className="text-sm text-destructive mt-2">
            You must select or create a workspace to continue with onboarding.
          </p>
        )}
        
        <div className="mt-6">
          <Button 
            className="w-full" 
            onClick={onContinue}
          >
            Continue to Onboarding <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>
      </div>
    </Card>
  );
}
