
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { Table } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { AlertCircle, CheckCircle, XCircle, RefreshCw, ShieldAlert, Download } from "lucide-react";
import AdminOnly from "@/guards/AdminOnly";

interface RlsPolicy {
  policyname: string;
  tablename: string;
  command: string;
  definition: string;
  permissive: string;
  roles: string[];
}

interface RlsTable {
  tablename: string;
  rlsEnabled: boolean;
  policies: RlsPolicy[];
}

interface AccessTestResult {
  tableName: string;
  status: "allowed" | "blocked" | "error" | "untested";
  errorMessage?: string;
  rowCount?: number;
}

export default function RlsAuditReport() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [tables, setTables] = useState<RlsTable[]>([]);
  const [testResults, setTestResults] = useState<AccessTestResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  useEffect(() => {
    fetchRlsTables();
  }, []);

  const fetchRlsTables = async () => {
    setIsLoading(true);
    try {
      // Get list of all tables in the public schema
      const { data: allTables, error: tablesError } = await supabase
        .from("pg_tables")
        .select("tablename")
        .eq("schemaname", "public");

      if (tablesError) throw tablesError;
      
      const tableResults: RlsTable[] = [];
      
      // Check RLS status for each table
      for (const table of allTables) {
        const { data: rlsCheck, error: rlsError } = await supabase
          .rpc("check_table_rls_status", { table_name: table.tablename });
        
        if (rlsError) {
          console.error(`Error checking RLS status for ${table.tablename}:`, rlsError);
          continue;
        }
        
        const isRlsEnabled = rlsCheck?.[0]?.rls_enabled || false;
        
        // Get policies for this table if RLS is enabled
        let policies: RlsPolicy[] = [];
        if (isRlsEnabled) {
          const { data: policyData, error: policyError } = await supabase
            .from("pg_policies")
            .select("*")
            .eq("tablename", table.tablename)
            .eq("schemaname", "public");
            
          if (policyError) {
            console.error(`Error fetching policies for ${table.tablename}:`, policyError);
          } else {
            policies = policyData;
          }
        }
        
        tableResults.push({
          tablename: table.tablename,
          rlsEnabled: isRlsEnabled,
          policies: policies
        });
      }
      
      setTables(tableResults);
      setTestResults([]);
      setLastRun(null);
    } catch (error) {
      console.error("Error fetching RLS tables:", error);
      toast.error("Failed to fetch RLS information", {
        description: "Check console for details"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runAccessTests = async () => {
    if (!user || !tenant) {
      toast.warning("Authentication required", {
        description: "You must be logged in with an active tenant to run access tests"
      });
      return;
    }
    
    setIsRunningTests(true);
    const results: AccessTestResult[] = [];
    
    try {
      // Test access to each table with RLS enabled
      for (const table of tables) {
        if (!table.rlsEnabled) continue;
        
        try {
          // Attempt to select from the table
          const { data, error, count } = await supabase
            .from(table.tablename)
            .select("*", { count: "exact" })
            .limit(1);
          
          if (error) {
            results.push({
              tableName: table.tablename,
              status: "error",
              errorMessage: error.message,
            });
          } else {
            results.push({
              tableName: table.tablename,
              status: "allowed",
              rowCount: count || 0
            });
          }
        } catch (e: any) {
          results.push({
            tableName: table.tablename,
            status: "blocked",
            errorMessage: e.message
          });
        }
      }
      
      setTestResults(results);
      setLastRun(new Date().toLocaleString());
      toast.success("Access tests completed", {
        description: `Tested ${results.length} tables with RLS enabled`
      });
    } catch (error) {
      console.error("Error running access tests:", error);
      toast.error("Failed to complete access tests", {
        description: "Check console for details"
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const checkPolicyAuthReference = (policy: RlsPolicy) => {
    const definition = policy.definition.toLowerCase();
    const hasAuthUid = definition.includes('auth.uid()');
    const hasTenantReference = 
      definition.includes('tenant_id') || 
      definition.includes('user_id');
    
    if (!hasAuthUid) return false;
    if (!hasTenantReference) return false;
    
    return true;
  };

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
        // Table has RLS but no policies
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
      
      // Find the test result for this table
      const testResult = testResults.find(r => r.tableName === table.tablename);
      
      table.policies.forEach(policy => {
        const hasAuthReference = checkPolicyAuthReference(policy);
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
          hasAuthReference ? 'Yes' : '🚨 NO AUTH REFERENCE',
          testResultText
        ]);
      });
    });
    
    // Create CSV content
    const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rls-audit-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPolicyStatusBadge = (policy: RlsPolicy) => {
    const hasAuthReference = checkPolicyAuthReference(policy);
    
    if (!hasAuthReference) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <ShieldAlert className="h-3 w-3" />
          Insecure
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Secured
      </Badge>
    );
  };

  const getTestResultBadge = (result: AccessTestResult) => {
    if (result.status === 'allowed') {
      return (
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Allowed ({result.rowCount} rows)
        </Badge>
      );
    } else if (result.status === 'blocked') {
      return (
        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Blocked
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Error: {result.errorMessage}
        </Badge>
      );
    }
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

    // Flat map of all tables with their policies
    const tableRows: JSX.Element[] = [];
    
    tables.sort((a, b) => {
      if (a.rlsEnabled === b.rlsEnabled) {
        return a.tablename.localeCompare(b.tablename);
      }
      return a.rlsEnabled ? -1 : 1; // Show tables with RLS enabled first
    }).forEach(table => {
      const testResult = testResults.find(r => r.tableName === table.tablename);
      
      if (!table.rlsEnabled) {
        tableRows.push(
          <tr key={`${table.tablename}`} className="bg-gray-50">
            <td className="p-3 border">{table.tablename}</td>
            <td className="p-3 border text-center">
              <Badge variant="outline" className="bg-gray-50 text-gray-500">
                Disabled
              </Badge>
            </td>
            <td className="p-3 border" colSpan={3}>No RLS protection</td>
            <td className="p-3 border text-center">N/A</td>
          </tr>
        );
        return;
      }
      
      if (table.policies.length === 0) {
        // Critical: RLS enabled but no policies (effectively denies all access)
        tableRows.push(
          <tr key={`${table.tablename}`} className="bg-red-50">
            <td className="p-3 border">{table.tablename}</td>
            <td className="p-3 border text-center">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Enabled
              </Badge>
            </td>
            <td className="p-3 border text-red-700" colSpan={3}>
              <div className="flex items-center gap-1">
                <ShieldAlert className="h-4 w-4" />
                <span className="font-semibold">CRITICAL: RLS enabled but no policies (denies all access)</span>
              </div>
            </td>
            <td className="p-3 border text-center">
              {testResult && getTestResultBadge(testResult)}
            </td>
          </tr>
        );
        return;
      }
      
      // Add rows for each policy
      table.policies.forEach((policy, policyIndex) => {
        const hasAuthRef = checkPolicyAuthReference(policy);
        
        tableRows.push(
          <tr 
            key={`${table.tablename}-${policy.policyname}`}
            className={!hasAuthRef ? "bg-red-50" : (policyIndex % 2 === 0 ? "bg-white" : "bg-gray-50")}
          >
            {policyIndex === 0 ? (
              <td className="p-3 border" rowSpan={table.policies.length}>
                {table.tablename}
              </td>
            ) : null}
            
            {policyIndex === 0 ? (
              <td className="p-3 border text-center" rowSpan={table.policies.length}>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Enabled
                </Badge>
              </td>
            ) : null}
            
            <td className="p-3 border">{policy.policyname}</td>
            <td className="p-3 border">{policy.command}</td>
            <td className="p-3 border">
              {getPolicyStatusBadge(policy)}
            </td>
            
            {policyIndex === 0 ? (
              <td className="p-3 border text-center" rowSpan={table.policies.length}>
                {testResult ? (
                  getTestResultBadge(testResult)
                ) : (
                  <Badge variant="outline" className="bg-gray-100 text-gray-500">
                    Not Tested
                  </Badge>
                )}
              </td>
            ) : null}
          </tr>
        );
      });
    });
    
    return tableRows;
  };

  return (
    <AdminOnly>
      <div className="container mx-auto py-6">
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
                  onClick={runAccessTests}
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
        
        <div className="mt-6 space-y-4">
          <h3 className="text-xl font-semibold">Security Audit Tips</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Alert>
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Critical Issues</AlertTitle>
              <AlertDescription className="text-sm space-y-1">
                <p>• Tables with RLS enabled but no policies (denies all access)</p>
                <p>• Policies with no auth.uid() reference (potential data leakage)</p>
                <p>• Policies with no tenant isolation (cross-tenant data access)</p>
              </AlertDescription>
            </Alert>
            
            <Alert variant="outline">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Best Practices</AlertTitle>
              <AlertDescription className="text-sm space-y-1">
                <p>• All tables should have RLS enabled</p>
                <p>• Each policy should reference auth.uid()</p>
                <p>• Each policy should reference tenant_id for isolation</p>
                <p>• Default service role policies should exist for system operations</p>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </AdminOnly>
  );
}
