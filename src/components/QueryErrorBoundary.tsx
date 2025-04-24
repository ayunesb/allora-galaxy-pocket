
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface QueryErrorBoundaryProps {
  error: Error | null;
  resetQuery?: () => void;
  children: React.ReactNode;
}

export function QueryErrorBoundary({ error, resetQuery, children }: QueryErrorBoundaryProps) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <p>{error.message}</p>
          {resetQuery && (
            <Button 
              variant="outline" 
              onClick={() => resetQuery()}
              className="w-fit"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
