
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: Error | string | null;
  onRetry?: () => void;
  onRefresh?: () => void;
}

export function ErrorState({
  title = "An error occurred",
  description,
  error,
  onRetry,
  onRefresh,
}: ErrorStateProps) {
  const errorMessage = typeof error === 'string' 
    ? error 
    : error?.message || description || 'Something went wrong. Please try again.';

  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-4">{errorMessage}</p>
        <div className="flex space-x-2">
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry} 
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Try again
            </Button>
          )}
          {onRefresh && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={onRefresh} 
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Refresh page
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
