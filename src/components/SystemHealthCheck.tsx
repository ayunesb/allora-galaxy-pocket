
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CronJobStatus } from "./system-health/CronJobStatus";
import { useIsMobile } from "@/hooks/use-mobile";

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
            <Tabs defaultValue="functions">
              <TabsList className="mb-4">
                <TabsTrigger value="functions">Edge Functions</TabsTrigger>
                <TabsTrigger value="database">Database</TabsTrigger>
                <TabsTrigger value="storage">Storage</TabsTrigger>
              </TabsList>
              
              <TabsContent value="functions" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Avg. Execution Time</div>
                    <div className="text-2xl font-bold">247ms</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Success Rate</div>
                    <div className="text-2xl font-bold">98.2%</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Total Executions</div>
                    <div className="text-2xl font-bold">1,284</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Active Functions</div>
                    <div className="text-2xl font-bold">8</div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="database" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Query Performance</div>
                    <div className="text-2xl font-bold">52ms</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Active Connections</div>
                    <div className="text-2xl font-bold">12</div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="storage" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Storage Used</div>
                    <div className="text-2xl font-bold">237MB</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Files Stored</div>
                    <div className="text-2xl font-bold">428</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>
              System alerts and resolution status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between p-3 border rounded-lg bg-amber-50 border-amber-200">
                <div>
                  <div className="font-medium">Elevated Response Times</div>
                  <div className="text-sm text-muted-foreground">Edge function latency above threshold</div>
                </div>
                <div className="text-sm text-amber-600 font-medium">Investigating</div>
              </div>
              <div className="flex justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                <div>
                  <div className="font-medium">Database Connection Issue</div>
                  <div className="text-sm text-muted-foreground">Intermittent connection timeouts</div>
                </div>
                <div className="text-sm text-green-600 font-medium">Resolved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
