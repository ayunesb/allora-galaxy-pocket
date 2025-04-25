
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onRefresh: () => void;
}

export function ErrorState({ error, onRetry, onRefresh }: ErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error loading workspaces</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">{error}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try Again
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Refresh Page
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
