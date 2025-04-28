
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ApiErrorMessageProps {
  title?: string;
  error?: Error | string | unknown;
  onRetry?: () => void;
  compact?: boolean;
}

export function ApiErrorMessage({
  title = 'Unable to load data',
  error,
  onRetry,
  compact = false
}: ApiErrorMessageProps) {
  let errorMessage = 'An unexpected error occurred';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-destructive text-sm">
        <AlertCircle className="h-4 w-4" />
        <span>{title}: {errorMessage}</span>
        {onRetry && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRetry}
            className="h-6 p-1"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{errorMessage}</p>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="bg-background hover:bg-background/90 text-foreground border-muted"
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

export default ApiErrorMessage;
