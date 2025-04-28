
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface TransitionErrorHandlerProps {
  children: React.ReactNode;
  from?: string;
  to?: string;
  onRetry?: () => void;
  error?: Error | null;
}

export function TransitionErrorHandler({ 
  children, 
  from,
  to,
  onRetry,
  error: propError
}: TransitionErrorHandlerProps) {
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  
  // Only try to use router hooks if they are available
  let location;
  let navigate;
  
  try {
    location = useLocation();
    navigate = useNavigate();
  } catch (e) {
    console.warn("TransitionErrorHandler used outside Router context");
    // If we can't access router, just render children
    if (!propError) {
      return <>{children}</>;
    }
  }

  // Reset error state on route change if we have location
  useEffect(() => {
    if (location) {
      setHasError(false);
      setErrorInfo(null);
    }
  }, [location?.pathname]);

  // Set error state from prop error
  useEffect(() => {
    if (propError) {
      setHasError(true);
      setErrorInfo(propError.message || 'Unknown error during navigation');
      toast.error('Navigation error', {
        description: 'There was a problem loading the page'
      });
    }
  }, [propError]);

  // Global error handler for route transition errors
  useEffect(() => {
    const handleRouteError = (event: ErrorEvent) => {
      console.error('Route transition error:', event.error);
      setHasError(true);
      setErrorInfo(event.error?.message || 'Unknown error during navigation');
      toast.error('Navigation error', {
        description: 'There was a problem loading the page'
      });
      event.preventDefault();
    };

    window.addEventListener('error', handleRouteError);
    return () => window.removeEventListener('error', handleRouteError);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    if (navigate) {
      navigate('/');
    } else {
      window.location.href = '/';
    }
  };

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Navigation Error</AlertTitle>
            <AlertDescription>
              {from && to && (
                <p className="mb-2">Error transitioning from {from} to {to}</p>
              )}
              {errorInfo || 'An error occurred while loading this page.'}
            </AlertDescription>
          </Alert>
          
          <div className="flex space-x-2">
            {onRetry ? (
              <Button onClick={onRetry} className="flex items-center gap-1">
                <RefreshCw className="h-4 w-4" /> 
                Try Again
              </Button>
            ) : (
              <Button onClick={handleRefresh} className="flex items-center gap-1">
                <RefreshCw className="h-4 w-4" /> 
                Refresh
              </Button>
            )}
            <Button variant="outline" onClick={handleGoHome} className="flex items-center gap-1">
              <Home className="h-4 w-4" /> 
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
