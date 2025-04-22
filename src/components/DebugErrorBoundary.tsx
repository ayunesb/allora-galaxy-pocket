
import React, { ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface DebugErrorBoundaryProps {
  children: ReactNode;
}

interface DebugErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  showDetails: boolean;
}

export class DebugErrorBoundary extends React.Component<DebugErrorBoundaryProps, DebugErrorBoundaryState> {
  constructor(props: DebugErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<DebugErrorBoundaryState> {
    console.error("Error caught in DebugErrorBoundary:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Component error details:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    console.log("Retrying component render...");
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Card className="border-red-500 shadow-lg m-4">
          <CardHeader className="bg-red-50 dark:bg-red-900/20">
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle size={18} />
              Component Error on Route: {window.location.pathname}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 font-medium">{this.state.error?.message || 'An unexpected error occurred'}</p>
            
            <Button 
              variant="outline" 
              className="mb-4 w-full flex justify-between"
              onClick={this.toggleDetails}
            >
              <span>Error details</span>
              {this.state.showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
            
            {this.state.showDetails && (
              <div className="whitespace-pre-wrap text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">
                <p className="text-red-600 dark:text-red-400 font-mono">
                  {this.state.error?.stack}
                </p>
                <hr className="my-2 border-gray-300 dark:border-gray-600" />
                <p className="text-gray-700 dark:text-gray-300 font-mono">
                  {this.state.errorInfo?.componentStack}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={this.handleRetry} variant="default" className="flex gap-2">
              <RefreshCw size={16} /> Reload Page
            </Button>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              variant="outline"
            >
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      );
    }

    try {
      // Add an extra try/catch to prevent blank pages
      return this.props.children;
    } catch (error) {
      console.error("Error rendering children in DebugErrorBoundary:", error);
      return (
        <Card className="border-amber-500 shadow-lg m-4">
          <CardHeader className="bg-amber-50 dark:bg-amber-900/20">
            <CardTitle className="text-amber-600 dark:text-amber-400">Render Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>An error occurred while rendering this component.</p>
            <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto">
              {error instanceof Error ? error.message : 'Unknown error'}
            </pre>
          </CardContent>
          <CardFooter>
            <Button onClick={this.handleRetry} variant="outline" className="mt-4">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      );
    }
  }
}
