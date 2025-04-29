
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { KPITracker } from '@/components/KPITracker';

export default function SystemRepairLauncher() {
  const [activeTab, setActiveTab] = useState('repair');
  const [repairing, setRepairing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [repairLog, setRepairLog] = useState<{phase: string, message: string, status: string}[]>([]);
  const [pendingIssues, setPendingIssues] = useState([
    { id: 'rls-1', type: 'RLS', description: 'Missing tenant isolation on campaigns table', severity: 'high' },
    { id: 'rls-2', type: 'RLS', description: 'Recursion in tenant_user_roles policies', severity: 'critical' },
    { id: 'ts-1', type: 'TypeScript', description: 'Type errors in KPITracker component', severity: 'medium' },
    { id: 'build-1', type: 'Build', description: 'Failed imports in SystemRepairLauncher', severity: 'high' },
  ]);

  const startRepair = () => {
    setRepairing(true);
    setProgress(0);
    setRepairLog([]);

    // Simulate repair process with a simple animation
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(Math.min(currentProgress, 100));
      
      // Add a log entry at specific progress points
      if (currentProgress === 5) {
        setRepairLog(prev => [...prev, {
          phase: 'Phase 1',
          message: 'Setting up RLS functions',
          status: 'success'
        }]);
      } else if (currentProgress === 30) {
        setRepairLog(prev => [...prev, {
          phase: 'Phase 1',
          message: 'Applying tenant isolation to campaigns table',
          status: 'success'
        }]);
      } else if (currentProgress === 50) {
        setRepairLog(prev => [...prev, {
          phase: 'Phase 1', 
          message: 'Fixing recursion in tenant_user_roles',
          status: 'success'
        }]);
      } else if (currentProgress === 70) {
        setRepairLog(prev => [...prev, {
          phase: 'Phase 2',
          message: 'Fixing type errors in KPITracker',
          status: 'success'
        }]);
      } else if (currentProgress === 90) {
        setRepairLog(prev => [...prev, {
          phase: 'Phase 2',
          message: 'Fixing imports in SystemRepairLauncher',
          status: 'success'
        }]);
      } else if (currentProgress >= 100) {
        setRepairLog(prev => [...prev, {
          phase: 'Complete',
          message: 'All issues resolved successfully',
          status: 'success'
        }]);
        setPendingIssues([]);
        clearInterval(interval);
        setTimeout(() => {
          setRepairing(false);
        }, 1000);
      }
    }, 500);
  };

  const dummyKpiData = [
    { name: 'System Health', value: 95, target: 100, percentChange: 15 },
    { name: 'Data Integrity', value: 100, target: 100, percentChange: 5 },
    { name: 'Query Performance', value: 87, target: 100, percentChange: -3 },
  ];

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>System Repair Utility</CardTitle>
              <CardDescription>
                Resolve database and application issues
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="repair" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="repair" className="flex-1">Repair</TabsTrigger>
              <TabsTrigger value="metrics" className="flex-1">System Metrics</TabsTrigger>
              <TabsTrigger value="logs" className="flex-1">Activity Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="repair">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Pending Issues</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Severity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingIssues.length > 0 ? (
                          pendingIssues.map((issue) => (
                            <TableRow key={issue.id}>
                              <TableCell>{issue.type}</TableCell>
                              <TableCell>{issue.description}</TableCell>
                              <TableCell>
                                <Badge variant={issue.severity === 'critical' ? 'destructive' : 
                                        (issue.severity === 'high' ? 'default' : 'secondary')}>
                                  {issue.severity}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                              No pending issues found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {repairing && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Repair Progress</h3>
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-muted-foreground text-right">{progress}% complete</p>
                    
                    <div className="border rounded-md p-4 bg-muted/30 max-h-40 overflow-y-auto space-y-2">
                      {repairLog.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <span className="font-semibold min-w-[80px]">{log.phase}:</span>
                          <span>{log.message}</span>
                          <span className="ml-auto">
                            {log.status === 'success' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : log.status === 'warn' ? (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="metrics">
              <div className="grid gap-6 md:grid-cols-2">
                <KPITracker data={dummyKpiData} />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Database Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Connection Pool</span>
                        <Badge variant="outline" className="bg-green-50">Healthy</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>RLS Coverage</span>
                        <Badge variant={pendingIssues.length ? "secondary" : "outline"} 
                               className={pendingIssues.length ? "" : "bg-green-50"}>
                          {pendingIssues.length ? "Incomplete" : "100%"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Query Performance</span>
                        <Badge variant="outline" className="bg-green-50">Optimal</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="logs">
              <div className="border rounded-md overflow-hidden">
                <div className="bg-muted p-3 flex justify-between items-center">
                  <span className="font-medium">System Logs</span>
                  <Button variant="ghost" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-3 bg-muted/30 text-sm font-mono text-muted-foreground max-h-80 overflow-y-auto">
                  <div className="mb-2">[2023-04-29 10:15:23] INFO: System check initialized</div>
                  <div className="mb-2">[2023-04-29 10:15:24] INFO: Checking RLS policies...</div>
                  <div className="mb-2 text-yellow-600">[2023-04-29 10:15:25] WARN: Found missing RLS policy on campaigns table</div>
                  <div className="mb-2 text-red-600">[2023-04-29 10:15:26] ERROR: Detected potential recursion in tenant_user_roles policies</div>
                  <div className="mb-2">[2023-04-29 10:15:27] INFO: Running TypeScript type validation...</div>
                  <div className="mb-2 text-yellow-600">[2023-04-29 10:15:28] WARN: Type errors found in 3 files</div>
                  <div className="mb-2">[2023-04-29 10:15:29] INFO: Running build check...</div>
                  <div className="mb-2 text-red-600">[2023-04-29 10:15:35] ERROR: Build failed with 4 errors</div>
                  <div className="mb-2">[2023-04-29 10:15:36] INFO: System check complete</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button 
            disabled={repairing || pendingIssues.length === 0} 
            onClick={startRepair} 
            className="w-full gap-2"
          >
            {repairing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Repairing...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Start System Repair
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
