
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KpiErrorStateProps {
  error: Error | unknown;
  onRetry?: () => void;
}

export default function KpiErrorState({ error, onRetry }: KpiErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  
  return (
    <div className="flex flex-col items-center justify-center h-64 w-full p-4 border rounded-lg bg-muted/10">
      <AlertCircle className="h-8 w-8 text-destructive mb-4" />
      <h3 className="font-semibold text-lg mb-2">Failed to load KPI metrics</h3>
      <p className="text-muted-foreground text-center mb-4">{errorMessage}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}
