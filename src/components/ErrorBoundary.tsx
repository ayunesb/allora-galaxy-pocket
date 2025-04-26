
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useRouteError } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean, error: Error | null, errorInfo: React.ErrorInfo | null }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to an error reporting service
    console.error("Application error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
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
                  <div className="bg-slate-100 p-2 rounded-md mt-2 overflow-auto max-h-32 text-xs">
                    <pre className="font-mono text-xs text-red-600">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
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
  const error = useRouteError() as any;
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Navigation Error</AlertTitle>
          <AlertDescription className="pt-2">
            <p className="text-sm">
              {error?.statusText || error?.message || "An unexpected error occurred loading this page"}
            </p>
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-4 justify-center mt-6">
          <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={() => {
            window.history.back();
          }}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
