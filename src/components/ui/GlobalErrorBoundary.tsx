
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { ToastService } from "@/services/ToastService";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showRefreshButton?: boolean;
  showHomeButton?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console
    console.error("Error caught by GlobalErrorBoundary:", error);
    console.error("Component stack:", errorInfo.componentStack);
    
    // Show toast notification
    ToastService.error({
      title: "An error occurred",
      description: "The application encountered an unexpected error"
    });
  }

  render() {
    if (this.state.hasError) {
      // Show custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error view
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          
          <div className="flex gap-3">
            {this.props.showRefreshButton !== false && (
              <Button 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
            )}
            
            {this.props.showHomeButton !== false && (
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
            )}
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-xs text-muted-foreground">
              <summary className="cursor-pointer">Error Details</summary>
              <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-[300px] text-wrap">
                {this.state.error?.stack}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
