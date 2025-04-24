import React, { useEffect } from 'react';
import { useKpiAlerts } from '@/hooks/useKpiAlerts';
import { useTenant } from '@/hooks/useTenant';
import { toast } from '@/components/ui/sonner';

export function GrowthPanel() {
  const { tenant } = useTenant();
  const { alerts = [], campaignInsights = [], refreshAlerts, triggerKpiCheck } = useKpiAlerts();

  useEffect(() => {
    const refreshData = async () => {
      try {
        await refreshAlerts();
      } catch (error) {
        console.error('Failed to refresh alerts:', error);
      }
    };

    refreshData();
  }, [refreshAlerts]);

  const handleRunAnalysis = async () => {
    if (tenant?.id) {
      await triggerKpiCheck(tenant.id);
    } else {
      toast.error("No tenant selected");
    }
  };

  return <div>GrowthPanel Component</div>;
}
