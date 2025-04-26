
import React from 'react';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';

interface DataLoaderProps<T> {
  isLoading: boolean;
  isError: boolean;
  error: Error | null | string | unknown;
  data: T | undefined | null;
  children: (data: T) => React.ReactNode;
  loadingMessage?: string;
  errorTitle?: string;
  onRetry?: () => void;
  emptyState?: React.ReactNode;
}

export function DataLoader<T>({
  isLoading,
  isError,
  error,
  data,
  children,
  loadingMessage = "Loading data...",
  errorTitle = "Failed to load data",
  onRetry,
  emptyState,
}: DataLoaderProps<T>) {
  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (isError) {
    return (
      <ErrorState
        title={errorTitle}
        error={error as Error}
        onRetry={onRetry}
      />
    );
  }

  if (!data && emptyState) {
    return <>{emptyState}</>;
  }

  // Only render children if we have data
  return <>{data ? children(data as T) : null}</>;
}
