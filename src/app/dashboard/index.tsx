
import { useNavigate } from "react-router-dom";
import { 
  ChartBar, 
  Bell, 
  MessageSquare, 
  Zap, 
  Rocket, 
  Target,
  BarChart2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";

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
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Current Strategy
            </h2>
            <p className="text-sm text-muted-foreground">
              {strategyData?.title || "No active strategy found"}
            </p>
            <Button 
              variant="link" 
              className="mt-2 h-auto p-0" 
              onClick={() => navigate("/strategy")}
            >
              View Full Strategy →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold mb-2 flex items-center gap-2">
              <Rocket className="h-4 w-4 text-primary" />
              Campaigns
            </h2>
            <p className="text-sm text-muted-foreground">
              {campaignsCount} {campaignsCount === 1 ? 'campaign' : 'campaigns'} awaiting approval
            </p>
            <Button 
              variant="link" 
              className="mt-2 h-auto p-0" 
              onClick={() => navigate("/campaigns/center")}
            >
              Go to Campaign Center →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <ChartBar className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Performance Snapshot</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              This week: ROI {kpiSummary?.roi || '0x'}, {kpiSummary?.leads || 0} leads
            </p>
            <Button 
              variant="link" 
              className="mt-2 h-auto p-0" 
              onClick={() => navigate("/dashboard/performance")}
            >
              View Full Report →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Notifications</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              AI CEO has {notificationsCount} new suggestion{notificationsCount !== 1 ? 's' : ''} for you
            </p>
            <Button 
              variant="link" 
              className="mt-2 h-auto p-0" 
              onClick={() => navigate("/notifications")}
            >
              View Growth Feed →
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Assistant</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Need to send an email, generate a post, or book a call?
          </p>
          <Button 
            variant="link"
            className="mt-2 h-auto p-0"
            onClick={() => navigate("/assistant")}
          >
            Open AI Assistant →
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">KPI Analytics</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your business metrics and performance indicators
          </p>
          <Button 
            variant="link"
            className="mt-2 h-auto p-0"
            onClick={() => navigate("/insights/kpis")}
          >
            View KPI Dashboard →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
