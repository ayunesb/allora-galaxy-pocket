import React, { useState } from "react";
import { useSecurityAudit } from "@/hooks/useSecurityAudit";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SecurityScoreCard } from "./components/dashboard/SecurityScoreCard";
import { TablesAnalyzedCard } from "./components/dashboard/TablesAnalyzedCard";
import { SecurityEventsCard } from "./components/dashboard/SecurityEventsCard";
import { SecurityDistributionChart } from "./components/dashboard/SecurityDistributionChart";
import { SecurityAuditTable } from "./components/SecurityAuditTable";
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
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SecurityScoreCard score={overallScore} />
        <TablesAnalyzedCard 
          totalTables={results.length} 
          securityScores={securityScores} 
        />
        <SecurityEventsCard 
          eventsCount={securityLogs.length}
          lastEventDate={securityLogs[0]?.created_at && new Date(securityLogs[0].created_at).toLocaleString()}
        />
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

      <SecurityDistributionChart securityScores={securityScores} />

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tables">Table Security</TabsTrigger>
          <TabsTrigger value="logs">Security Logs</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-6">
          
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
