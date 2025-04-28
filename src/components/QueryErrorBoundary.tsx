
import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface QueryErrorBoundaryProps {
  children: ReactNode;
  error: any | null;
  resetQuery: () => void;
  fallback?: ReactNode;
}

interface QueryErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class QueryErrorBoundary extends Component<QueryErrorBoundaryProps, QueryErrorBoundaryState> {
  constructor(props: QueryErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): QueryErrorBoundaryState {
    return { 
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by QueryErrorBoundary:', error, errorInfo);
  }

  componentDidUpdate(prevProps: QueryErrorBoundaryProps): void {
    // Reset error state if props error becomes null
    if (prevProps.error && !this.props.error) {
      this.setState({ hasError: false, error: null });
    }
  }

  render(): ReactNode {
    const { children, error: propsError, resetQuery, fallback } = this.props;
    const { hasError, error: stateError } = this.state;
    
    // Error from props has priority over local state
    const actualError = propsError || stateError;
    
    if (propsError || hasError) {
      if (fallback) {
        return fallback;
      }

      const errorMessage = actualError instanceof Error 
        ? actualError.message 
        : typeof actualError === 'string' 
          ? actualError 
          : 'An unexpected error occurred';

      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading data</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">{errorMessage}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetQuery}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Try again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return children;
  }
}
