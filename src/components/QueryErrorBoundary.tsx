
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface QueryErrorBoundaryProps {
  error: Error | null | unknown;
  resetQuery?: () => void;
  children: React.ReactNode;
  title?: string;
  showDetails?: boolean;
}

/**
 * Component for handling query errors consistently across the application
 * Provides error message and retry functionality
 */
export function QueryErrorBoundary({ 
  error, 
  resetQuery, 
  children, 
  title = "Error", 
  showDetails = true 
}: QueryErrorBoundaryProps) {
  if (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string'
        ? error
        : 'An unexpected error occurred';

    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <p>{errorMessage}</p>
          {showDetails && error instanceof Error && error.stack && (
            <details className="mt-2">
              <summary className="text-xs cursor-pointer">Technical details</summary>
              <pre className="mt-2 text-xs whitespace-pre-wrap bg-secondary/50 p-2 rounded-md overflow-auto max-h-40">
                {error.stack}
              </pre>
            </details>
          )}
          {resetQuery && (
            <Button 
              variant="outline" 
              onClick={() => resetQuery()}
              className="w-fit mt-2"
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
