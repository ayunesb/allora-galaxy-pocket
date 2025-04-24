
import React from 'react';
import { SystemMetricsPanel } from './SystemMetricsPanel';
import { SystemAlertsPanel } from './SystemAlertsPanel';
import { PerformancePanel } from './PerformancePanel';
import AdminOnly from '@/guards/AdminOnly';

export default function SystemMonitoringPage() {
  return (
    <AdminOnly>
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold mb-6">System Monitoring</h1>
        
        <div className="grid gap-6">
          <SystemAlertsPanel />
          <SystemMetricsPanel />
          <PerformancePanel />
        </div>
      </div>
    </AdminOnly>
  );
}
