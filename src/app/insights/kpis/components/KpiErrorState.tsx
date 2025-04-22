
import { AlertTriangle } from "lucide-react";

interface KpiErrorStateProps {
  error: unknown;
}

export default function KpiErrorState({ error }: KpiErrorStateProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-4" />
        <h2 className="text-xl font-medium mb-2">Error Loading KPI Metrics</h2>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : 'An unknown error occurred while loading KPI data.'}
        </p>
      </div>
    </div>
  );
}
