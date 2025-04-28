
import { useUnifiedKpiAlerts } from './useUnifiedKpiAlerts';

interface KpiAlertsOptions {
  days?: number;
  activeOnly?: boolean;
  severity?: string;
}

export function useKpiAlerts(options?: KpiAlertsOptions) {
  const unifiedHook = useUnifiedKpiAlerts(options);
  
  return {
    alerts: unifiedHook.alerts,
    kpiAlerts: unifiedHook.rawKpiAlerts,
    kpiInsights: unifiedHook.rawKpiInsights,
    campaignInsights: [], // Kept for backward compatibility
    isLoading: unifiedHook.isLoading,
    error: unifiedHook.error,
    triggerKpiCheck: unifiedHook.triggerKpiCheck,
    refreshAlerts: unifiedHook.refreshAlerts
  };
}
