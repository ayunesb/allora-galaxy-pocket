
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useKpiMetrics } from '@/hooks/useKpiMetrics';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { useTenant } from '@/hooks/useTenant';
import { KpiMetric } from '@/types/metrics';

const AdminDashboard = ({ ...props }: any) => {
  const { tenant } = useTenant();
  const { metrics, isLoading } = useKpiMetrics();
  const { logActivity } = useSystemLogs();
  
  // Log dashboard access
  useEffect(() => {
    if (tenant?.id) {
      logActivity(
        'ADMIN_DASHBOARD_VIEW',
        'Admin dashboard accessed',
        {
          timestamp: new Date().toISOString()
        }
      );
    }
  }, [tenant?.id]);

  // Extract relevant metrics
  const calculateSystemHealth = (metrics: KpiMetric[]) => {
    const healthMetric = metrics.find(m => m.metric === 'system_health');
    return healthMetric?.value || 0;
  };
  
  const calculateUserActivity = (metrics: KpiMetric[]) => {
    const activityMetric = metrics.find(m => m.metric === 'user_activity');
    return activityMetric?.value || 0;
  };

  // Calculate summaries
  const systemHealth = metrics ? calculateSystemHealth(metrics) : 0;
  const userActivity = metrics ? calculateUserActivity(metrics) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : `${systemHealth}%`}</div>
          <p className="text-xs text-muted-foreground">
            Overall health status of the system
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : `${userActivity}`}</div>
          <p className="text-xs text-muted-foreground">
            Active users in the last 24 hours
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Tenant Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tenant ? 1 : 0}</div>
          <p className="text-xs text-muted-foreground">
            Current active tenant
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
