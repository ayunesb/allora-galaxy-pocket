import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import AdminOnly from "@/guards/AdminOnly";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { useRlsData } from "./hooks/useRlsData";
import { useAccessTests } from "./hooks/useAccessTests";
import { useSecurityAudit } from "./hooks/useSecurityAudit";
import { SecurityAuditTable } from "./components/SecurityAuditTable";
import { SecurityIssuesList } from "./components/SecurityIssuesList";
import { AuditHeaderActions } from "./components/AuditHeaderActions";
import { DebugErrorBoundary } from "@/components/DebugErrorBoundary";

export default function RlsAuditReport() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { tables, loading: isLoading, error, fetchRlsTables } = useRlsData();
  const { testResults, isRunningTests, lastRun, runAccessTests } = useAccessTests();
  const { issues, isLoading: isAuditLoading, runSecurityAudit } = useSecurityAudit();

  const downloadReport = () => {
    const rows = [
      ['Table', 'RLS Enabled', 'Policy Name', 'Command', 'References auth.uid()', 'Access Test Result']
    ];
    
    tables.map(table => {
      if (!table.hasRls) {
        rows.push([table.tableName, 'No', '-', '-', '-', 'N/A']);
        return;
      }
      
      if (!table.policies || table.policies.length === 0) {
        rows.push([table.tableName, 'Yes', 'NO POLICIES', '-', '-', 'CRITICAL: RLS enabled but no policies']);
        return;
      }
      
      const testResult = testResults.find(r => r.tableName === table.tableName);
      table.policies.forEach(policy => {
        const definition = policy.definition.toLowerCase();
        const hasAuthUid = definition.includes('auth.uid()');
        const hasTenantReference = definition.includes('tenant_id') || definition.includes('user_id');
        rows.push([
          table.tableName,
          'Yes',
          policy.policyname,
          policy.command,
          hasAuthUid && hasTenantReference ? 'Yes' : 'NO AUTH REFERENCE',
          testResult ? `${testResult.status} (${testResult.rowCount || 0} rows)` : 'Not tested'
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
                <AuditHeaderActions
                  onRefresh={() => {
                    fetchRlsTables();
                    runSecurityAudit();
                  }}
                  onRunTests={() => runAccessTests(tables)}
                  onExport={downloadReport}
                  isLoading={isLoading || isAuditLoading}
                  isRunningTests={isRunningTests}
                  hasData={tables.length > 0}
                />
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
              
              <SecurityIssuesList issues={issues} />
              
              {testResults.length > 0 && (
                <div className="mb-4 text-sm text-muted-foreground">
                  <p>Tests run at: {lastRun}</p>
                  <p>User ID: {user?.id}</p>
                  <p>Tenant ID: {tenant?.id}</p>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <SecurityAuditTable
                  tables={tables}
                  testResults={testResults}
                  isLoading={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </DebugErrorBoundary>
      </div>
    </AdminOnly>
  );
}
