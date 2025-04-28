
import React from 'react';
import { KpiSection } from './components/KpiSection';
import { StrategySection } from './components/StrategySection';
import { CampaignSection } from './components/CampaignSection';
import { useStrategyAndCampaigns } from './hooks/useStrategyAndCampaigns';
import { useQuery } from '@tanstack/react-query';
import { useTenantValidation } from '@/hooks/useTenantValidation';
import { Navigate } from 'react-router-dom';
import { KpiAlertsPanel } from '@/app/insights/kpis/components/KpiAlertsPanel';
import { useUnifiedKpiAlerts } from '@/hooks/useUnifiedKpiAlerts';
import { supabase } from '@/integrations/supabase/client';
import { Strategy } from '@/types/strategy';
import { Campaign } from '@/types/campaign';

const DashboardPage: React.FC = () => {
  const { strategies, campaigns } = useStrategyAndCampaigns();
  const { isValidating, isValid } = useTenantValidation();
  const { alerts } = useUnifiedKpiAlerts({ activeOnly: true, days: 7 });
  
  // Fetch KPI metrics directly since useKpiTracking hook doesn't exist
  const { data: kpiMetrics = [] } = useQuery({
    queryKey: ['kpi-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kpi_metrics')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching KPI metrics:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  if (isValidating) {
    return <div>Validating workspace...</div>;
  }

  if (!isValid) {
    return <Navigate to="/workspace" replace />;
  }

  // The strategies are already properly typed from useStrategyAndCampaigns
  const typedCampaigns = (campaigns || []) as Campaign[];

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <KpiSection kpiMetrics={kpiMetrics} />
      <StrategySection strategies={strategies} />
      <CampaignSection campaigns={typedCampaigns} />
      <KpiAlertsPanel alerts={alerts} />
    </div>
  );
};

export default DashboardPage;
