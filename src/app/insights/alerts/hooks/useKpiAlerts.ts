
import { useUnifiedKpiAlerts } from "@/hooks/useUnifiedKpiAlerts";

// Re-export the consolidated hook for backward compatibility
export function useKpiAlerts() {
  const { 
    alerts, 
    isLoading, 
    error,
    refreshAlerts,
    triggerKpiCheck
  } = useUnifiedKpiAlerts({ 
    activeOnly: true,
    days: 7
  });
  
  return {
    data: alerts,
    isLoading,
    error,
    refetch: refreshAlerts,
    triggerKpiCheck
  };
}
