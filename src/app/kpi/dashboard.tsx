
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KpiMetricsGrid } from './components/KpiMetricsGrid';
import { KpiTrends } from './components/KpiTrends';
import { KpiAlerts } from './components/KpiAlerts';
import { toast } from 'sonner';
import { useTenant } from '@/hooks/useTenant';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface KpiData {
  metric: string;
  value: number;
  recordedAt: Date;
}

export default function KpiDashboard() {
  const { tenant } = useTenant();

  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['kpi-metrics', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from('kpi_metrics')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('recorded_at', { ascending: false });

        if (error) throw error;
        return data as KpiData[];
      } catch (error) {
        toast.error('Failed to load KPI metrics');
        return [];
      }
    },
    enabled: !!tenant?.id
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">KPI Dashboard</h1>
        <Button onClick={() => refetch()} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <KpiMetricsGrid metrics={metrics || []} isLoading={isLoading} />
      <KpiTrends metrics={metrics || []} />
      <KpiAlerts />
    </div>
  );
}
