
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

interface KpiErrorStateProps {
  error: unknown;
}

export default function KpiErrorState({ error }: KpiErrorStateProps) {
  const queryClient = useQueryClient();
  
  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['kpi-metrics-processed'] });
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
      <h3 className="text-lg font-medium mb-2">Failed to load KPI metrics</h3>
      <p className="text-muted-foreground mb-4 text-center">
        {error instanceof Error ? error.message : 'An unknown error occurred'}
      </p>
      <Button onClick={handleRetry}>Retry</Button>
    </div>
  );
}
