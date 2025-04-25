
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: Error | string | null;
  onRetry?: () => void;
}

export function ErrorState({
  title = "An error occurred",
  description,
  error,
  onRetry,
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
      </AlertDescription>
    </Alert>
  );
}
