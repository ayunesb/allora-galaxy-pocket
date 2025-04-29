'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenant } from "@/hooks/useTenant";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import SystemHealthMetrics from "@/components/SystemHealthMetrics";
import { KpiDashboard } from "@/app/insights/kpis/KpiDashboard";
import { GrowthPanel } from "@/app/notifications/GrowthPanel";

export default function DashboardPage() {
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();

  useEffect(() => {
    if (tenant?.id) {
      logActivity(
        'DASHBOARD_VIEW', 
        'Dashboard page accessed'
      );
    }
  }, [tenant?.id]);

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
          </CardHeader>
          <CardContent>
            {tenant ? (
              <>
                <h2 className="text-2xl font-bold">{tenant.name}</h2>
                <p className="text-muted-foreground">
                  {tenant.is_demo ? 'Demo Workspace' : 'Active Workspace'}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">No workspace selected</p>
            )}
          </CardContent>
        </Card>
        
        <SystemHealthMetrics />
      </div>
      
      <KpiDashboard />
      
      <GrowthPanel />
    </div>
  );
}
