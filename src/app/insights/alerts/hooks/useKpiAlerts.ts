
import { useKpiAlerts as useConsolidatedKpiAlerts } from "@/hooks/useKpiAlerts";

// Re-export the consolidated hook for backward compatibility
export function useKpiAlerts(severity?: string, days: number = 7) {
  const { alerts, isLoading, error, refreshAlerts } = useConsolidatedKpiAlerts({ 
    severity,
    days
  });
  
  return {
    data: alerts,
    isLoading,
    error,
    refetch: refreshAlerts
  };
}
