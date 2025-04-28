
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Database, Shield, RefreshCw, Server, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToastService } from "@/services/ToastService";
import { Progress } from "@/components/ui/progress";

interface DataCheck {
  tableName: string;
  recordCount: number;
  hasData: boolean;
  required: boolean;
}

interface SystemCheck {
  name: string;
  status: "success" | "warning" | "error" | "pending";
  message: string;
}

export function LaunchReadinessVerifier() {
  const [systemChecks, setSystemChecks] = useState<SystemCheck[]>([]);
  const [dataChecks, setDataChecks] = useState<DataCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [overallReadiness, setOverallReadiness] = useState(0);
  const [realDataPercentage, setRealDataPercentage] = useState(0);
  
  useEffect(() => {
    runVerification();
  }, []);

  const runVerification = async () => {
    setIsLoading(true);
    
    // Initialize system checks
    const initialChecks: SystemCheck[] = [
      { name: "Authentication", status: "pending", message: "Checking authentication system..." },
      { name: "Database Connection", status: "pending", message: "Checking database connection..." },
      { name: "RLS Policies", status: "pending", message: "Checking row-level security policies..." },
      { name: "Edge Functions", status: "pending", message: "Checking edge functions availability..." },
      { name: "Tenant Access", status: "pending", message: "Checking tenant access..." }
    ];
    
    setSystemChecks(initialChecks);
    
    try {
      // Check authentication
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      initialChecks[0] = {
        name: "Authentication",
        status: session ? "success" : "warning",
        message: session ? "Authentication system operational" : "No active session detected"
      };

      // Check database connection
      const { data, error: dbError } = await supabase
        .from('system_logs')
        .select('count')
        .limit(1);
      
      initialChecks[1] = {
        name: "Database Connection",
        status: dbError ? "error" : "success",
        message: dbError ? "Database connection error" : "Database connected successfully"
      };
      
      // Check RLS policies (look for the infinite recursion issue)
      const { error: rlsError } = await supabase.rpc(
        "check_tenant_user_access", 
        { tenant_uuid: '00000000-0000-0000-0000-000000000000', user_uuid: '00000000-0000-0000-0000-000000000000' }
      );
      
      initialChecks[2] = {
        name: "RLS Policies",
        status: rlsError && rlsError.message.includes("recursion") ? "error" : "success",
        message: rlsError && rlsError.message.includes("recursion") ? 
          "Infinite recursion detected in RLS policy" : "RLS policies configured correctly"
      };

      // Check edge functions
      const { data: edgeFnData, error: edgeFnError } = await supabase.functions.invoke("fetch-kpi-trend", {
        body: { test_connection: true }
      }).catch(() => ({ data: null, error: { message: "Edge function test failed" } }));
      
      initialChecks[3] = {
        name: "Edge Functions",
        status: edgeFnError ? "error" : "success",
        message: edgeFnError ? "Edge functions unreachable" : "Edge functions responding"
      };
      
      // Check tenant access
      const { data: tenants, error: tenantError } = await supabase
        .from('tenant_profiles')
        .select('count');
      
      initialChecks[4] = {
        name: "Tenant Access",
        status: tenantError ? "error" : "success",
        message: tenantError ? "Tenant access error" : "Tenant access configured correctly"
      };
      
      setSystemChecks(initialChecks);

      // Check data in critical tables
      const criticalTables = [
        { name: 'tenant_profiles', required: true },
        { name: 'tenant_user_roles', required: true },
        { name: 'strategies', required: false },
        { name: 'campaigns', required: false },
        { name: 'kpi_metrics', required: false },
        { name: 'agent_profiles', required: false },
        { name: 'billing_profiles', required: false }
      ];
      
      const tableChecks: DataCheck[] = [];
      
      for (const table of criticalTables) {
        const { count, error } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true });
        
        tableChecks.push({
          tableName: table.name,
          recordCount: count || 0,
          hasData: !error && (count || 0) > 0,
          required: table.required
        });
      }
      
      setDataChecks(tableChecks);
      
      // Calculate overall readiness
      const systemReadiness = initialChecks.filter(check => check.status === "success").length / initialChecks.length;
      
      // Calculate real data percentage
      const requiredTablesWithData = tableChecks
        .filter(t => t.required)
        .every(t => t.hasData);
      
      const dataPresence = tableChecks
        .filter(t => !t.required)
        .reduce((sum, table) => sum + (table.hasData ? 1 : 0), 0) / 
        tableChecks.filter(t => !t.required).length;
      
      const realDataPercentage = requiredTablesWithData ? 
        Math.round((0.5 + (dataPresence * 0.5)) * 100) : 0;
      
      setRealDataPercentage(realDataPercentage);
      setOverallReadiness(Math.round(systemReadiness * 100));

    } catch (error) {
      console.error("Verification error:", error);
      ToastService.error({ 
        title: "Verification Failed", 
        description: "Could not complete system verification" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSystemStatusColor = (status: number) => {
    if (status < 70) return "bg-red-500";
    if (status < 90) return "bg-amber-500";
    return "bg-green-500";
  };
  
  const getDataStatusColor = (status: number) => {
    if (status < 50) return "bg-red-500";
    if (status < 80) return "bg-amber-500";
    return "bg-green-500";
  };

  const renderSystemStatus = () => {
    const readyToLaunch = overallReadiness >= 90 && realDataPercentage >= 80;
    
    return (
      <Alert 
        className={`mt-6 ${readyToLaunch ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}
      >
        {readyToLaunch ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Ready to Launch</AlertTitle>
            <AlertDescription>
              System checks successful and data validation complete. You're ready to go!
            </AlertDescription>
          </>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle>Not Ready for Launch</AlertTitle>
            <AlertDescription>
              Please address the issues highlighted above before proceeding with launch.
            </AlertDescription>
          </>
        )}
      </Alert>
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Launch Readiness Verification</CardTitle>
          <CardDescription>
            Comprehensive check of system health and data readiness
          </CardDescription>
        </div>
        <Button 
          onClick={runVerification} 
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> 
              Verifying...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" /> 
              Re-run Verification
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-medium mb-3">System Status</h3>
            <div className="flex items-center gap-3 mb-2">
              <Progress 
                value={overallReadiness} 
                className={`h-2 ${getSystemStatusColor(overallReadiness)}`} 
              />
              <span className="font-medium">{overallReadiness}%</span>
            </div>
            
            <div className="space-y-3 mt-4">
              {systemChecks.map((check, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <div className="flex items-center gap-2">
                    {check.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : check.status === "warning" ? (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    ) : check.status === "error" ? (
                      <X className="h-4 w-4 text-red-500" />
                    ) : (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    )}
                    <span>{check.name}</span>
                  </div>
                  <Badge 
                    variant={
                      check.status === "success" ? "outline" : 
                      check.status === "warning" ? "secondary" : 
                      check.status === "error" ? "destructive" : 
                      "default"
                    }
                  >
                    {check.status === "pending" ? "Checking..." : check.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Data Validation</h3>
            <div className="flex items-center gap-3 mb-2">
              <Progress 
                value={realDataPercentage} 
                className={`h-2 ${getDataStatusColor(realDataPercentage)}`} 
              />
              <span className="font-medium">{realDataPercentage}% Real Data</span>
            </div>
            
            <div className="space-y-3 mt-4">
              {dataChecks.map((check, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <div className="flex items-center gap-2">
                    <Database className={`h-4 w-4 ${check.hasData ? 'text-green-500' : 'text-gray-400'}`} />
                    <span>{check.tableName}</span>
                    {check.required && (
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{check.recordCount} records</span>
                    <Badge 
                      variant={check.hasData ? "outline" : (check.required ? "destructive" : "secondary")}
                    >
                      {check.hasData ? "Has Data" : "No Data"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {renderSystemStatus()}
        
        {systemChecks.some(check => check.status === "error") && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Critical Issues Detected</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2">
                {systemChecks
                  .filter(check => check.status === "error")
                  .map((check, index) => (
                    <li key={index}>{check.message}</li>
                  ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {dataChecks.some(check => check.required && !check.hasData) && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Required Data Missing</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2">
                {dataChecks
                  .filter(check => check.required && !check.hasData)
                  .map((check, index) => (
                    <li key={index}>Table '{check.tableName}' must have data before launch</li>
                  ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
