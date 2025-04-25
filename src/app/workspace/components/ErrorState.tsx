
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
  onRefresh: () => void;
}

export function ErrorState({ error, onRetry, onRefresh }: ErrorStateProps) {
  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-center">
      <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
      <h3 className="text-lg font-medium mb-2">Error Loading Workspaces</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {error || "An error occurred while loading your workspaces"}
      </p>
      <div className="flex space-x-2 justify-center">
        <Button onClick={onRetry} size="sm" variant="default">
          <RefreshCw className="h-4 w-4 mr-1" />
          Retry
        </Button>
        <Button onClick={onRefresh} size="sm" variant="outline">
          Refresh Page
        </Button>
      </div>
    </div>
  );
}
