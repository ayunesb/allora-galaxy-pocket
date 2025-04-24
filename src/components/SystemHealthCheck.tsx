
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CronJobStatus } from "./system-health/CronJobStatus";
import { useIsMobile } from "@/hooks/use-mobile";
import { SystemHealthMetrics } from "./SystemHealthMetrics";

export default function SystemHealthCheck() {
  const isMobile = useIsMobile();
  
  return (
    <div className={`p-4 ${isMobile ? 'space-y-6' : 'grid gap-6 lg:grid-cols-2'}`}>
      <div>
        <h2 className="text-2xl font-bold mb-4">System Health Dashboard</h2>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Operation Status</CardTitle>
            <CardDescription>
              Current health status of system automation processes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CronJobStatus />
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
            <CardDescription>
              Performance metrics across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SystemHealthMetrics />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
