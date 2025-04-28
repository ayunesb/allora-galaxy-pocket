
import { useUnifiedKpiAlerts } from "@/hooks/useUnifiedKpiAlerts";

// Re-export the consolidated hook for backward compatibility
export function useKpiAlerts(severity?: string, days: number = 7) {
  const { alerts, isLoading, error, refreshAlerts } = useUnifiedKpiAlerts({ 
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
