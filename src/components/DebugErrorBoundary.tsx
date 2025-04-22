
import React, { ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface DebugErrorBoundaryProps {
  children: ReactNode;
}

interface DebugErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class DebugErrorBoundary extends React.Component<DebugErrorBoundaryProps, DebugErrorBoundaryState> {
  constructor(props: DebugErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): DebugErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Component error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Card className="border-red-500 shadow-lg">
          <CardHeader className="bg-red-50 dark:bg-red-900/20">
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle size={18} />
              Component Error Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 font-medium">{this.state.error?.message}</p>
            <details className="whitespace-pre-wrap text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">
              <summary className="cursor-pointer font-medium mb-2">Error details</summary>
              <p className="text-red-600 dark:text-red-400 font-mono">
                {this.state.error?.stack}
              </p>
              <hr className="my-2 border-gray-300 dark:border-gray-600" />
              <p className="text-gray-700 dark:text-gray-300 font-mono">
                {this.state.errorInfo?.componentStack}
              </p>
            </details>
          </CardContent>
          <CardFooter>
            <Button onClick={this.handleRetry} variant="outline" className="flex gap-2">
              <RefreshCw size={16} /> Try Again
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return this.props.children;
  }
}
