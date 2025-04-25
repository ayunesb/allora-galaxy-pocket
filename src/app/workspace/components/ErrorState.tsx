
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
  onRefresh: () => void;
}

export function ErrorState({ error, onRetry, onRefresh }: ErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error loading workspaces</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{error || 'Failed to load workspace data'}</p>
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={onRetry} variant="outline">
            Try Again
          </Button>
          <Button size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh Page
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
