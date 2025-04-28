
import React from 'react';
import { ApiErrorMessage } from './ApiErrorMessage';
import { LoadingIndicator } from './LoadingIndicator';
import { EmptyState } from './EmptyState';

interface AsyncDataRendererProps<T> {
  data: T | undefined | null;
  isLoading: boolean;
  error: Error | unknown | null;
  onRetry?: () => void;
  
  // Render functions
  children: (data: NonNullable<T>) => React.ReactNode;
  
  // Custom components
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  
  // Options
  loadingText?: string;
  errorTitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  checkEmpty?: (data: T) => boolean;
}

export function AsyncDataRenderer<T>({
  data,
  isLoading,
  error,
  onRetry,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  loadingText = "Loading...",
  errorTitle = "Failed to load data",
  emptyTitle = "No data available",
  emptyDescription,
  checkEmpty = (data) => !data || (Array.isArray(data) && data.length === 0)
}: AsyncDataRendererProps<T>) {
  
  // Show loading state
  if (isLoading) {
    return loadingComponent || <LoadingIndicator variant="card" text={loadingText} />;
  }
  
  // Show error state
  if (error) {
    return errorComponent || <ApiErrorMessage title={errorTitle} error={error} onRetry={onRetry} />;
  }
  
  // Show empty state
  if (checkEmpty(data)) {
    return emptyComponent || (
      <EmptyState 
        title={emptyTitle} 
        description={emptyDescription} 
        action={onRetry ? { label: "Retry", onClick: onRetry } : undefined}
      />
    );
  }
  
  // Show data
  return <>{children(data as NonNullable<T>)}</>;
}

export default AsyncDataRenderer;
