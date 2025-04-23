
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw, ArrowLeft, Database } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log to console
    console.error("Error caught by EnhancedErrorBoundary:", error, errorInfo);
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Here you could also log to an error reporting service like Sentry
  }

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  }

  render() {
    if (this.state.hasError) {
      // Check if a custom fallback component is provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-[50vh] p-4">
          <Card className="w-full max-w-2xl shadow-lg border-red-200 dark:border-red-900">
            <CardHeader className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/50">
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="mb-4 text-lg font-medium">
                {this.state.error?.message || "An unexpected error occurred"}
              </div>
              
              <div className="mb-4 text-sm text-muted-foreground">
                The application encountered an error. You can try refreshing the page or go back to the previous page.
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={this.toggleDetails}
                className="mb-4"
              >
                {this.state.showDetails ? "Hide" : "Show"} Technical Details
              </Button>
              
              {this.state.showDetails && (
                <div className="mb-4 p-4 bg-slate-100 dark:bg-slate-900 rounded-md overflow-auto max-h-64">
                  <p className="font-mono text-xs whitespace-pre-wrap text-red-600 dark:text-red-400 mb-2">
                    {this.state.error?.stack}
                  </p>
                  {this.state.errorInfo && (
                    <p className="font-mono text-xs whitespace-pre-wrap text-slate-700 dark:text-slate-300 mt-4">
                      Component Stack:{this.state.errorInfo.componentStack}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-wrap gap-2 border-t border-muted pt-4">
              <Button onClick={() => window.location.reload()} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </Button>
              
              <Button onClick={() => window.history.back()} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              
              <Button onClick={() => window.location.href = '/'} variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
              
              <Button 
                onClick={() => window.open('/admin/logs', '_blank')} 
                variant="ghost"
                className="ml-auto"
              >
                <Database className="h-4 w-4 mr-2" />
                View Logs
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
