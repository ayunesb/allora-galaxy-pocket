import React from 'react';
import { KpiSection } from './components/KpiSection';
import { StrategySection } from './components/StrategySection';
import { CampaignSection } from './components/CampaignSection';
import { useStrategyAndCampaigns } from './hooks/useStrategyAndCampaigns';
import { useKpiMetrics } from '@/hooks/useKpiTracking';
import { useTenantValidation } from '@/hooks/useTenantValidation';
import { Navigate } from 'react-router-dom';
import { KpiAlertsPanel } from '@/app/insights/kpis/components/KpiAlertsPanel';
import { useKpiAlerts } from '@/hooks/useKpiAlerts';

const DashboardPage: React.FC = () => {
  const { strategies, campaigns } = useStrategyAndCampaigns();
  const { kpiMetrics } = useKpiMetrics();
  const { isValidating, isValid } = useTenantValidation();
  const { alerts } = useKpiAlerts();

  if (isValidating) {
    return <div>Validating workspace...</div>;
  }

  if (!isValid) {
    return <Navigate to="/workspace" replace />;
  }

  // Transform API data to conform to Strategy interface
  const strategiesList = strategies?.map(item => ({
    ...item,
    metrics_target: item.metrics_target || {}, // Add missing required field
    tags: item.tags || [],
    goals: item.goals || [],
    channels: item.channels || [],
    kpis: item.kpis || [],
  } as any));

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <KpiSection kpiMetrics={kpiMetrics} />
      <StrategySection strategies={strategiesList} />
      <CampaignSection campaigns={campaigns} />
      <KpiAlertsPanel alerts={alerts} />
    </div>
  );
};

export default DashboardPage;
