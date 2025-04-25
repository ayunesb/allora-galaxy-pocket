
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onRefresh: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  error,
  onRetry,
  onRefresh
}) => {
  return (
    <div className="mt-2">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertTitle>Error loading workspaces</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      
      <div className="flex flex-col gap-2 mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
        <Button 
          size="sm" 
          onClick={onRefresh}
        >
          Refresh Page
        </Button>
      </div>
    </div>
  );
};
