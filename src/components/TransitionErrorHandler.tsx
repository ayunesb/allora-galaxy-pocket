
import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useSystemLogs } from '@/hooks/useSystemLogs';

interface TransitionErrorHandlerProps {
  from: string;
  to: string;
  onRetry: () => void;
  error?: Error | null;
  children: React.ReactNode;
}

export function TransitionErrorHandler({
  from,
  to,
  onRetry,
  error,
  children
}: TransitionErrorHandlerProps) {
  const [hasError, setHasError] = useState<boolean>(!!error);
  const [errorDetails, setErrorDetails] = useState<string | null>(error?.message || null);
  const { logActivity } = useSystemLogs();
  
  useEffect(() => {
    setHasError(!!error);
    setErrorDetails(error?.message || null);
    
    if (error) {
      // Log transition error
      logActivity({
        event_type: 'TRANSITION_ERROR',
        message: `Error during transition from ${from} to ${to}: ${error.message}`,
        meta: {
          from,
          to,
          error: error.message,
          stack: error.stack
        },
        severity: 'error'
      });
    }
  }, [error, from, to, logActivity]);
  
  const handleRetry = async () => {
    try {
      // Log retry attempt
      await logActivity({
        event_type: 'TRANSITION_RETRY',
        message: `Retrying transition from ${from} to ${to}`,
        meta: { from, to },
        severity: 'info'
      });
      
      onRetry();
      setHasError(false);
      setErrorDetails(null);
    } catch (retryError: any) {
      setErrorDetails(retryError.message || 'Retry failed');
      
      // Log retry failure
      logActivity({
        event_type: 'TRANSITION_RETRY_FAILED',
        message: `Retry failed for transition from ${from} to ${to}: ${retryError.message}`,
        meta: {
          from,
          to,
          error: retryError.message
        },
        severity: 'error'
      });
    }
  };

  if (!hasError) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-4">
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error during transition</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>
            {errorDetails || `There was an error transitioning from ${from} to ${to}.`}
          </p>
          <div className="flex space-x-2 mt-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRetry}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
