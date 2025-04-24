
import React from 'react';
import { SystemMetricsPanel } from './SystemMetricsPanel';
import { SystemAlertsPanel } from './SystemAlertsPanel';
import { PerformancePanel } from './PerformancePanel';
import { JobMonitoringPanel } from './JobMonitoringPanel';
import AdminOnly from '@/guards/AdminOnly';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

export default function SystemMonitoringPage() {
  return (
    <AdminOnly>
      <QueryClientProvider client={queryClient}>
        <div className="container mx-auto py-6 space-y-6">
          <h1 className="text-3xl font-bold mb-6">System Monitoring</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SystemAlertsPanel />
            <PerformancePanel />
          </div>
          
          <JobMonitoringPanel />
          <SystemMetricsPanel />
        </div>
      </QueryClientProvider>
    </AdminOnly>
  );
}
