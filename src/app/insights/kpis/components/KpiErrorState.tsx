
import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export interface KpiErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

export function KpiErrorState({ error, onRetry }: KpiErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium mb-2">Error Loading KPI Data</h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        {error?.message || "An unexpected error occurred while loading KPI metrics"}
      </p>
      <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  );
}

export default KpiErrorState;
