import React, { useState } from "react";
import { useSecurityAudit } from "@/hooks/useSecurityAudit";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Shield, RefreshCw, Lock, Database } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart } from "@/components/ui/charts";
import { ResponsiveTable, Column } from "@/components/ui/responsive-table";

export default function SecurityDashboard() {
  const { runSecurityAudit, results, isScanning } = useSecurityAudit();
  const { logs, filters, setFilters } = useSystemLogs();
  const [activeTab, setActiveTab] = useState("overview");

  // Filter for security-related logs only
  const securityLogs = logs.filter(log => 
    log.event_type.startsWith('SECURITY_') || 
    log.event_type.includes('AUTH_') ||
    log.event_type.includes('ACCESS_')
  );

  // Calculate overall security score
  const calculateOverallScore = () => {
    if (!results.length) return 0;
    const sum = results.reduce((total, item) => total + item.securityScore, 0);
    return Math.round(sum / results.length);
  };

  // Count tables by security level
  const countBySecurityLevel = () => {
    const counts = { high: 0, medium: 0, low: 0 };
    results.forEach(item => {
      if (item.securityScore >= 80) counts.high++;
      else if (item.securityScore >= 40) counts.medium++;
      else counts.low++;
    });
    return counts;
  };

  const securityScores = countBySecurityLevel();
  const overallScore = calculateOverallScore();

  // Format for the bar chart
  const chartData = {
    labels: ["High Security", "Medium Security", "Low Security"],
    datasets: [
      {
        label: "Tables by Security Level",
        data: [securityScores.high, securityScores.medium, securityScores.low],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"]
      }
    ]
  };

  const tableColumns: Column[] = [
    { header: "Table Name", accessorKey: "tableName" },
    { 
      header: "Security Score", 
      accessorKey: "securityScore",
      cell: (value) => (
        <div className="flex items-center space-x-2">
          <Progress value={value} className="w-20 h-2" />
          <span className="text-sm">{value}%</span>
        </div>
      )
    },
    { 
      header: "RLS", 
      accessorKey: "hasRls",
      cell: (value) => (
        <Badge className={value ? "bg-green-500" : "bg-red-500"}>
          {value ? "Enabled" : "Disabled"}
        </Badge>
      )
    },
    { 
      header: "Tenant ID", 
      accessorKey: "hasTenantId",
      cell: (value) => (
        <Badge variant={value ? "outline" : "destructive"}>
          {value ? "Present" : "Missing"}
        </Badge>
      )
    },
    { 
      header: "Auth Policies", 
      accessorKey: "hasAuthPolicies",
      cell: (value) => (
        <Badge variant={value ? "outline" : "destructive"}>
          {value ? "Secure" : "Missing"}
        </Badge>
      )
    }
  ];
  
  const logColumns: Column[] = [
    { 
      header: "Event Type", 
      accessorKey: "event_type",
      cell: (value) => (
        <Badge variant="outline" className="font-mono">
          {value}
        </Badge>
      )
    },
    { header: "Message", accessorKey: "message" },
    { 
      header: "Time", 
      accessorKey: "created_at",
      cell: (value) => (
        <span className="text-muted-foreground text-sm">
          {new Date(value).toLocaleString()}
        </span>
      )
    }
  ];

  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and improve your application's security posture
          </p>
        </div>
        <Button 
          onClick={runSecurityAudit} 
          disabled={isScanning} 
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
          Run Security Audit
        </Button>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tables">Table Security</TabsTrigger>
          <TabsTrigger value="logs">Security Logs</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Security Score</CardTitle>
                <Shield className={`h-5 w-5 ${overallScore > 80 ? 'text-green-500' : overallScore > 50 ? 'text-yellow-500' : 'text-red-500'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overallScore}%</div>
                <Progress value={overallScore} className="h-2 mt-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  {overallScore > 80 ? 'Good security posture' : 
                   overallScore > 50 ? 'Security needs improvement' : 
                   'Critical security issues detected'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Tables Analyzed</CardTitle>
                <Database className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{results.length}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
                    <span className="text-sm">High: {securityScores.high}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-yellow-500 mr-1"></div>
                    <span className="text-sm">Medium: {securityScores.medium}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-1"></div>
                    <span className="text-sm">Low: {securityScores.low}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Security Events</CardTitle>
                <Lock className="h-5 w-5 text-violet-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{securityLogs.length}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {securityLogs.length > 0 
                    ? `Last event: ${new Date(securityLogs[0].created_at).toLocaleString()}` 
                    : 'No security events recorded'}
                </p>
              </CardContent>
            </Card>
          </div>
          
          {results.some(r => r.securityScore < 40) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Critical Security Issues Detected</AlertTitle>
              <AlertDescription>
                {results.filter(r => r.securityScore < 40).length} tables have critical security issues that need immediate attention.
                Switch to the Tables tab for details.
              </AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Security Distribution</CardTitle>
              <CardDescription>Distribution of tables by security level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <BarChart data={chartData} height={260} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tables" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Table Security Analysis</CardTitle>
              <CardDescription>
                Review security settings for all database tables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveTable 
                columns={tableColumns} 
                data={results} 
                emptyMessage="Run a security audit to see table analysis"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Event Logs</CardTitle>
              <CardDescription>
                Recent security-related events in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveTable 
                columns={logColumns} 
                data={securityLogs} 
                emptyMessage="No security events have been logged"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Recommendations</CardTitle>
              <CardDescription>
                Suggested actions to improve security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results
                  .filter(item => item.recommendations.length > 0)
                  .map((item, i) => (
                    <Alert key={i} variant={item.securityScore < 40 ? "destructive" : "default"}>
                      <AlertTitle className="flex items-center gap-2">
                        {item.tableName}
                        <Badge>Score: {item.securityScore}%</Badge>
                      </AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 mt-2">
                          {item.recommendations.map((rec, j) => (
                            <li key={j}>{rec}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  ))}
                
                {results.filter(item => item.recommendations.length > 0).length === 0 && (
                  <p className="text-center py-4 text-muted-foreground">
                    No recommendations available. Run a security audit first.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
