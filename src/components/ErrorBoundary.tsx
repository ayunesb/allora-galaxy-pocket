
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, { 
  hasError: boolean; 
  error: Error | null; 
  errorInfo: React.ErrorInfo | null;
  errorDetails: string;
}> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorDetails: ''
    };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error,
      errorDetails: typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error)
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to an error reporting service
    console.error("Application error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="w-full max-w-md space-y-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">Something went wrong</AlertTitle>
              <AlertDescription className="pt-2 space-y-4">
                <p className="text-sm">
                  {this.state.error?.message || "An unexpected error occurred"}
                </p>
                
                {import.meta.env.DEV && this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer">Technical details</summary>
                    <div className="bg-slate-100 p-2 rounded-md mt-2 overflow-auto max-h-32">
                      <pre className="font-mono text-xs text-red-600 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </details>
                )}
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-4 justify-center mt-6">
              <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => {
                window.location.href = "/";
              }} className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// This is a hook version for routes
export function ErrorBoundaryRoute() {
  const error = useRouteError();
  
  let errorMessage = "An unexpected error occurred";
  let statusCode: number | undefined;
  
  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">
            Navigation Error {statusCode ? `(${statusCode})` : ''}
          </AlertTitle>
          <AlertDescription className="pt-2">
            <p className="text-sm">{errorMessage}</p>
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-4 justify-center mt-6">
          <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={() => {
            window.history.back();
          }} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
