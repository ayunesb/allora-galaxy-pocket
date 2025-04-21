import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsCard } from "./MetricsCard";
import { Tables } from "@/integrations/supabase/types";
import { PluginUsageChart } from "./PluginUsageChart";

type TenantAnalytics = Tables<"tenant_analytics">;

export default function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['tenant-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_analytics')
        .select(`
          *,
          tenant:tenant_profiles (
            name
          )
        `);

      if (error) throw error;
      return data as (TenantAnalytics & { tenant: { name: string } })[];
    }
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">🌐 Admin Analytics</h2>
        <p>Loading analytics...</p>
      </div>
    );
  }

  const totalMRR = analytics?.reduce((sum, t) => sum + Number(t.mrr), 0) || 0;
  const totalUsers = analytics?.reduce((sum, t) => sum + (t.active_users || 0), 0) || 0;
  const totalStrategies = analytics?.reduce((sum, t) => sum + (t.total_strategies || 0), 0) || 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">🌐 Admin Analytics</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <MetricsCard
            title="Total MRR"
            value={`$${totalMRR.toLocaleString()}`}
            description="Monthly Recurring Revenue"
          />
          <MetricsCard
            title="Active Users"
            value={totalUsers}
            description="Across all tenants"
          />
          <MetricsCard
            title="Total Strategies"
            value={totalStrategies}
            description="Created by all tenants"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {analytics?.map((tenant) => (
            <Card key={tenant.id}>
              <CardHeader>
                <CardTitle>{tenant.tenant?.name || 'Unnamed Tenant'}</CardTitle>
                <CardDescription>
                  {tenant.active_users} active users
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">MRR:</span>
                  <span className="font-medium">${tenant.mrr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Strategies:</span>
                  <span className="font-medium">{tenant.total_strategies}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <PluginUsageChart />
      </div>
    </div>
  );
}
