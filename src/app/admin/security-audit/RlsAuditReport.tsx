import React from "react";
import { Table } from "@/components/ui/table";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, ShieldAlert, Download } from "lucide-react";
import AdminOnly from "@/guards/AdminOnly";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { useRlsData } from "./hooks/useRlsData";
import { useAccessTests } from "./hooks/useAccessTests";
import { RlsTableRow } from "./components/RlsTableRow";
import { SecurityAuditTips } from "./components/SecurityAuditTips";
import { DebugErrorBoundary } from "@/components/DebugErrorBoundary";

export default function RlsAuditReport() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { tables, isLoading, fetchRlsTables } = useRlsData();
  const { testResults, isRunningTests, lastRun, runAccessTests } = useAccessTests();

  const downloadReport = () => {
    const rows = [
      ['Table', 'RLS Enabled', 'Policy Name', 'Command', 'References auth.uid()', 'Access Test Result']
    ];
    
    tables.forEach(table => {
      if (!table.rlsEnabled) {
        rows.push([
          table.tablename,
          'No',
          '-',
          '-',
          '-',
          'N/A'
        ]);
        return;
      }
      
      if (table.policies.length === 0) {
        rows.push([
          table.tablename,
          'Yes',
          'NO POLICIES',
          '-',
          '-',
          '🚨 CRITICAL: RLS enabled but no policies'
        ]);
        return;
      }
      
      const testResult = testResults.find(r => r.tableName === table.tablename);
      
      table.policies.forEach(policy => {
        const definition = policy.definition.toLowerCase();
        const hasAuthUid = definition.includes('auth.uid()');
        const hasTenantReference = 
          definition.includes('tenant_id') || 
          definition.includes('user_id');
        
        let testResultText = 'Not tested';
        
        if (testResult) {
          if (testResult.status === 'allowed') {
            testResultText = `✅ Allowed (${testResult.rowCount} rows)`;
          } else if (testResult.status === 'blocked') {
            testResultText = '❌ Blocked';
          } else {
            testResultText = `⚠️ Error: ${testResult.errorMessage}`;
          }
        }
        
        rows.push([
          table.tablename,
          'Yes',
          policy.policyname,
          policy.command,
          hasAuthUid && hasTenantReference ? 'Yes' : '🚨 NO AUTH REFERENCE',
          testResultText
        ]);
      });
    });
    
    const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rls-audit-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTableRows = () => {
    if (isLoading) {
      return Array(5).fill(0).map((_, index) => (
        <tr key={index}>
          <td colSpan={6} className="p-2">
            <Skeleton className="h-8 w-full" />
          </td>
        </tr>
      ));
    }

    return tables.map(table => (
      <DebugErrorBoundary key={table.tablename}>
        <RlsTableRow
          tableName={table.tablename}
          rlsEnabled={table.rlsEnabled}
          policies={table.policies}
          testResult={testResults.find(r => r.tableName === table.tablename)}
        />
      </DebugErrorBoundary>
    ));
  };

  return (
    <AdminOnly>
      <div className="container mx-auto py-6">
        <DebugErrorBoundary>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">Row-Level Security Audit</CardTitle>
                  <CardDescription>
                    Audit all tables with RLS enabled and test tenant-level access controls
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={fetchRlsTables}
                    disabled={isLoading}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Tables
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => runAccessTests(tables)}
                    disabled={isRunningTests || isLoading || !tables.length}
                    className="flex items-center gap-1"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    Run Access Tests
                  </Button>
                  <Button
                    variant="outline"
                    onClick={downloadReport}
                    disabled={!tables.length}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!user || !tenant ? (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Authentication Required</AlertTitle>
                  <AlertDescription>
                    You must be logged in with an active tenant to run access tests.
                  </AlertDescription>
                </Alert>
              ) : null}
              
              {tables.length === 0 && !isLoading ? (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Tables Found</AlertTitle>
                  <AlertDescription>
                    Could not retrieve table information from the database.
                  </AlertDescription>
                </Alert>
              ) : null}
              
              {testResults.length > 0 && (
                <div className="mb-4 text-sm text-muted-foreground">
                  <p>Tests run at: {lastRun}</p>
                  <p>User ID: {user?.id}</p>
                  <p>Tenant ID: {tenant?.id}</p>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <Table>
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-3 border">Table</th>
                      <th className="p-3 border">RLS Status</th>
                      <th className="p-3 border">Policy Name</th>
                      <th className="p-3 border">Command</th>
                      <th className="p-3 border">Auth Reference</th>
                      <th className="p-3 border">Access Test Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderTableRows()}
                  </tbody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </DebugErrorBoundary>
        
        <DebugErrorBoundary>
          <SecurityAuditTips />
        </DebugErrorBoundary>
      </div>
    </AdminOnly>
  );
}
