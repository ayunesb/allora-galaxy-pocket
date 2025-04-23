
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, XCircle, RefreshCw } from "lucide-react";
import AdminOnly from "@/guards/AdminOnly";

interface CheckResult {
  name: string;
  status: "success" | "warning" | "error";
  message: string;
  details?: string;
  actionNeeded?: string;
}

export default function ProductionReadinessPage() {
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [runTime, setRunTime] = useState<string | null>(null);

  const runChecks = async () => {
    setIsLoading(true);
    setRunTime(new Date().toLocaleString());
    
    const results: CheckResult[] = [];
    
    try {
      // 1. Check that secrets are configured
      const { data: secrets, error: secretsError } = await supabase.functions.invoke('check-secrets', {
        body: {}
      });
      
      if (secretsError) {
        results.push({
          name: "Required Secrets",
          status: "error",
          message: "Failed to check secrets configuration",
          details: secretsError.message
        });
      } else {
        results.push({
          name: "Required Secrets",
          status: secrets.missing.length > 0 ? "warning" : "success",
          message: secrets.missing.length > 0 
            ? `Missing ${secrets.missing.length} required secrets` 
            : "All required secrets are configured",
          details: secrets.missing.length > 0 
            ? `Missing: ${secrets.missing.join(", ")}` 
            : undefined,
          actionNeeded: secrets.missing.length > 0 
            ? "Configure missing secrets in Supabase dashboard" 
            : undefined
        });
      }
      
      // 2. Check database migrations status
      const { data: dbStatus } = await supabase
        .from("system_logs")
        .select("event_type, meta, created_at")
        .eq("event_type", "db_migration")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
        
      results.push({
        name: "Database Migrations",
        status: dbStatus?.meta?.success ? "success" : "warning",
        message: dbStatus?.meta?.success 
          ? "Last migration successful" 
          : "No recent migrations or last migration failed",
        details: dbStatus?.meta?.version 
          ? `Current version: ${dbStatus.meta.version}` 
          : undefined
      });
      
      // 3. Check RLS policies
      const { data: rlsCheck } = await supabase.functions.invoke('check-rls-policies', {
        body: {}
      });
      
      results.push({
        name: "RLS Policies",
        status: rlsCheck.unprotectedTables.length > 0 ? "warning" : "success",
        message: rlsCheck.unprotectedTables.length > 0 
          ? `${rlsCheck.unprotectedTables.length} tables without RLS` 
          : "All tables have RLS policies",
        details: rlsCheck.unprotectedTables.length > 0 
          ? `Tables without RLS: ${rlsCheck.unprotectedTables.join(", ")}` 
          : undefined,
        actionNeeded: rlsCheck.unprotectedTables.length > 0 
          ? "Add RLS policies to unprotected tables" 
          : undefined
      });
      
      // 4. Check edge functions status
      const { data: edgeFunctions, error: functionsError } = await supabase.functions.invoke('list-functions-status', {
        body: {}
      });
      
      if (functionsError) {
        results.push({
          name: "Edge Functions",
          status: "error",
          message: "Failed to check edge functions",
          details: functionsError.message
        });
      } else {
        const failedFunctions = edgeFunctions.filter((fn: any) => !fn.healthy);
        results.push({
          name: "Edge Functions",
          status: failedFunctions.length > 0 ? "warning" : "success",
          message: failedFunctions.length > 0 
            ? `${failedFunctions.length} edge functions with issues` 
            : "All edge functions are running properly",
          details: failedFunctions.length > 0 
            ? `Problem functions: ${failedFunctions.map((f: any) => f.name).join(", ")}` 
            : undefined
        });
      }
      
      // 5. Check for recent errors in logs
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const { data: recentErrors, error: errorsError } = await supabase
        .from("system_logs")
        .select("count")
        .eq("event_type", "error")
        .gte("created_at", oneDayAgo.toISOString())
        .single();
        
      results.push({
        name: "Recent Errors",
        status: (recentErrors?.count || 0) > 10 ? "warning" : "success",
        message: (recentErrors?.count || 0) > 0 
          ? `${recentErrors?.count || 0} errors in the last 24 hours` 
          : "No errors in the last 24 hours",
        actionNeeded: (recentErrors?.count || 0) > 10 
          ? "Review system logs for recurring issues" 
          : undefined
      });

    } catch (err) {
      console.error("Error running production readiness checks:", err);
      results.push({
        name: "System Check",
        status: "error",
        message: "Failed to complete all checks",
        details: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setChecks(results);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runChecks();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Ready</Badge>;
      case "warning":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Needs Attention</Badge>;
      case "error":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Critical Issue</Badge>;
      default:
        return null;
    }
  };

  return (
    <AdminOnly>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Production Readiness</h1>
          <Button 
            onClick={runChecks} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>Running Checks...</>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Run Checks
              </>
            )}
          </Button>
        </div>
        
        {runTime && (
          <p className="text-sm text-gray-500 mb-6">Last check: {runTime}</p>
        )}
        
        {checks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {checks.map((check, index) => (
              <Card key={index} className={
                check.status === "error" 
                  ? "border-red-200 dark:border-red-900/50" 
                  : check.status === "warning"
                    ? "border-amber-200 dark:border-amber-900/50"
                    : "border-green-200 dark:border-green-900/50"
              }>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(check.status)}
                    {check.name}
                  </CardTitle>
                  {getStatusBadge(check.status)}
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-sm mb-2">{check.message}</p>
                  
                  {check.details && (
                    <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                  )}
                  
                  {check.actionNeeded && check.status !== "success" && (
                    <Alert variant="destructive" className="mt-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Action Required</AlertTitle>
                      <AlertDescription>{check.actionNeeded}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {checks.length === 0 && !isLoading && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No system checks have been run yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminOnly>
  );
}
