
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSystemLogs } from "@/app/admin/components/AdminSystemLogs";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import type { KpiMetric } from "@/types/metrics";

export default function AdminDashboard() {
  const { logActivity } = useSystemLogs();

  useEffect(() => {
    // Log dashboard access with positional parameters
    logActivity(
      'ADMIN_DASHBOARD_VIEW', 
      'Admin dashboard accessed', 
      { timestamp: new Date().toISOString() }
    );
  }, [logActivity]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Health Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">Good</div>
            <p className="text-sm text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No recent alerts</p>
          </CardContent>
        </Card>
      </div>
      
      <AdminSystemLogs />
    </div>
  );
}
