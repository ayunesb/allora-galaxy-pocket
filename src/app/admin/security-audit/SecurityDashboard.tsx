
import React, { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SecurityScoreCard } from "./components/dashboard/SecurityScoreCard";
import { TablesAnalyzedCard } from "./components/dashboard/TablesAnalyzedCard";
import { SecurityEventsCard } from "./components/dashboard/SecurityEventsCard";
import { SecurityDistributionChart } from "./components/dashboard/SecurityDistributionChart";
import { SecurityIssuesList } from "./components/SecurityIssuesList";
import { useSecurityDashboard } from "./hooks/useSecurityDashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/ui/Card";
import { ResponsiveTable, Column } from "@/components/ui/responsive-table";

export default function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { 
    overallScore,
    securityScores,
    securityLogs,
    lastEventDate,
    hasCriticalIssues,
    criticalIssuesCount,
    results,
    isScanning,
    runSecurityAudit
  } = useSecurityDashboard();

  const tableColumns: Column[] = [
    { header: "Table Name", accessorKey: "tableName" },
    { 
      header: "Security Score", 
      accessorKey: "securityScore",
      cell: (value) => (
        <div className="flex items-center gap-2">
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

  return (
    <div className="container max-w-7xl mx-auto py-4 md:py-6 px-4 md:px-6 space-y-4 md:space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <SecurityScoreCard score={overallScore} />
        <TablesAnalyzedCard 
          totalTables={results.length} 
          securityScores={securityScores} 
        />
        <SecurityEventsCard 
          eventsCount={securityLogs.length}
          lastEventDate={lastEventDate}
        />
      </div>

      {hasCriticalIssues && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Security Issues Detected</AlertTitle>
          <AlertDescription>
            {criticalIssuesCount} tables have critical security issues that need immediate attention.
            Switch to the Tables tab for details.
          </AlertDescription>
        </Alert>
      )}

      <SecurityDistributionChart securityScores={securityScores} />

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}
            className="w-full">
        <TabsList className="mb-4 w-full flex overflow-x-auto space-x-1 md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tables">Table Security</TabsTrigger>
          <TabsTrigger value="logs">Security Logs</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tables" className="space-y-4 mt-4 md:mt-6">
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
        
        <TabsContent value="logs" className="space-y-4 mt-4 md:mt-6">
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
        
        <TabsContent value="recommendations" className="space-y-4 mt-4 md:mt-6">
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
                  .filter(item => item.recommendations?.length > 0)
                  .map((item, i) => (
                    <Alert key={i} variant={item.securityScore < 40 ? "destructive" : "default"}>
                      <AlertTitle className="flex items-center flex-wrap gap-2">
                        {item.tableName}
                        <Badge>Score: {item.securityScore}%</Badge>
                      </AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 mt-2">
                          {item.recommendations?.map((rec, j) => (
                            <li key={j}>{rec}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  ))}
                
                {results.filter(item => item.recommendations?.length > 0).length === 0 && (
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
