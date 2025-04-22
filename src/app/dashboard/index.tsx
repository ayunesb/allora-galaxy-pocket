
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { CurrentStrategyCard } from "./components/CurrentStrategyCard";
import { CampaignsCard } from "./components/CampaignsCard";
import { PerformanceSnapshotCard } from "./components/PerformanceSnapshotCard";
import { NotificationsCard } from "./components/NotificationsCard";
import { AssistantCard } from "./components/AssistantCard";
import { KpiAnalyticsCard } from "./components/KpiAnalyticsCard";

export default function DashboardHome() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { user } = useAuth();

  const { data: strategyData } = useQuery({
    queryKey: ['dashboard-strategy', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;
      const { data, error } = await supabase
        .from('vault_strategies')
        .select('title, id')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  const { data: campaignsCount } = useQuery({
    queryKey: ['dashboard-campaigns-count', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return 0;
      const { count, error } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)
        .eq('status', 'draft');
      if (error) throw error;
      return count || 0;
    },
    enabled: !!tenant?.id
  });

  const { data: kpiSummary } = useQuery({
    queryKey: ['dashboard-kpi-summary', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return { roi: '0x', leads: 0 };
      const { data, error } = await supabase
        .from('kpi_metrics')
        .select('metric, value')
        .eq('tenant_id', tenant.id)
        .in('metric', ['roi', 'leads']);
      if (error) throw error;
      const summary = { roi: '0x', leads: 0 };
      if (data) {
        data.forEach(metric => {
          if (metric.metric === 'roi') summary.roi = `${metric.value}x`;
          if (metric.metric === 'leads') summary.leads = metric.value;
        });
      }
      return summary;
    },
    enabled: !!tenant?.id
  });

  const { data: notificationsCount } = useQuery({
    queryKey: ['dashboard-notifications', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return 0;
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)
        .eq('is_read', false);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!tenant?.id
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Zap className="h-6 w-6 text-primary" />
        Welcome to Allora OS
      </h1>
      <div className="grid md:grid-cols-2 gap-4">
        <CurrentStrategyCard title={strategyData?.title} />
        <CampaignsCard campaignsCount={campaignsCount ?? 0} />
        <PerformanceSnapshotCard
          roi={kpiSummary?.roi}
          leads={kpiSummary?.leads}
        />
        <NotificationsCard notificationsCount={notificationsCount ?? 0} />
      </div>
      <AssistantCard />
      <KpiAnalyticsCard />
    </div>
  );
}
