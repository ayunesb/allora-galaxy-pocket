
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
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
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
    
    console.error('Workspace error caught:', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // Check if it's an infinite recursion error
      const isRecursionError = this.state.error?.message.includes('infinite recursion') ||
                              this.state.error?.stack?.includes('infinite recursion');
      
      return (
        <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <h2 className="text-lg font-semibold">
              {isRecursionError ? 'Database Policy Error' : 'Workspace Error'}
            </h2>
          </div>
          
          <div className="mb-4 text-muted-foreground">
            {isRecursionError ? (
              <p>A database policy issue was detected. The fix has been applied - please refresh the page to continue.</p>
            ) : (
              <p>An unexpected error occurred in the workspace component. Please try refreshing the page.</p>
            )}
          </div>
          
          <Button
            onClick={() => window.location.reload()}
            className="mb-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
          
          {!isRecursionError && (
            <div className="mt-4">
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground">Error Details</summary>
                <pre className="mt-2 p-2 bg-muted whitespace-pre-wrap rounded text-xs overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
