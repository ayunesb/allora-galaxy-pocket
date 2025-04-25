
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class WorkspaceErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Workspace component error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 rounded-md">
          <div className="flex items-center mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <h3 className="font-semibold text-red-600 dark:text-red-400">
              Workspace Error
            </h3>
          </div>
          
          <div className="text-sm text-red-600/70 dark:text-red-400/70 mb-4">
            <p>An error occurred while loading workspace components:</p>
            <p className="font-mono text-xs mt-2 p-2 bg-red-100 dark:bg-red-900/20 rounded overflow-auto">
              {this.state.error?.message || "Unknown error"}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={this.handleReset}
              className="border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/20"
            >
              Try Again
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={this.handleRefresh}
              className="border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/20"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
