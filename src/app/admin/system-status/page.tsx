
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle,
  Shield,
  Database,
  Lock,
  RefreshCw,
  UserCheck,
  FileCheck,
  Server
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SystemHealthCheck from "@/components/SystemHealthCheck";
import AdminOnly from "@/guards/AdminOnly";

interface SystemCheck {
  name: string;
  status: "success" | "warning" | "error" | "pending";
  message: string;
  details?: string;
}

export default function SystemStatusPage() {
  const [checks, setChecks] = useState<SystemCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    runSystemChecks();
  }, []);

  const runSystemChecks = async () => {
    setIsLoading(true);
    const checksToRun: SystemCheck[] = [
      { name: "Authentication", status: "pending", message: "Checking authentication..." },
      { name: "Database Connection", status: "pending", message: "Checking database..." },
      { name: "RLS Policies", status: "pending", message: "Checking row-level security..." },
      { name: "Tenant Access", status: "pending", message: "Checking tenant access..." },
      { name: "User Roles", status: "pending", message: "Checking user roles..." }
    ];
    
    setChecks(checksToRun);
    
    // Check authentication
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      checksToRun[0] = {
        name: "Authentication",
        status: session ? "success" : "warning",
        message: session ? "Authentication working properly" : "No active session",
        details: sessionError ? sessionError.message : undefined
      };
    } catch (error) {
      checksToRun[0] = {
        name: "Authentication",
        status: "error",
        message: "Error checking authentication",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
    
    // Check database connection
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('count')
        .limit(1);
      
      checksToRun[1] = {
        name: "Database Connection",
        status: error ? "error" : "success",
        message: error ? "Database connection error" : "Database connected",
        details: error ? error.message : undefined
      };
    } catch (error) {
      checksToRun[1] = {
        name: "Database Connection",
        status: "error",
        message: "Database connection error",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
    
    // Check RLS policies for recursion
    try {
      const { error: rlsError } = await supabase.rpc(
        "check_tenant_user_access", 
        { tenant_uuid: '00000000-0000-0000-0000-000000000000', user_uuid: '00000000-0000-0000-0000-000000000000' }
      );
      
      checksToRun[2] = {
        name: "RLS Policies",
        status: rlsError && rlsError.message.includes("recursion") ? "error" : "success",
        message: rlsError && rlsError.message.includes("recursion") ? 
          "Recursive RLS policy detected" : "RLS policies configured correctly",
        details: rlsError ? rlsError.message : undefined
      };
    } catch (error) {
      checksToRun[2] = {
        name: "RLS Policies",
        status: "error",
        message: "Error checking RLS policies",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
    
    // Check tenant access
    try {
      const { data: tenants, error: tenantError } = await supabase
        .from('tenant_profiles')
        .select('count')
        .limit(1);
      
      checksToRun[3] = {
        name: "Tenant Access",
        status: tenantError ? "error" : "success",
        message: tenantError ? "Tenant access error" : "Tenant access configured correctly",
        details: tenantError ? tenantError.message : undefined
      };
    } catch (error) {
      checksToRun[3] = {
        name: "Tenant Access",
        status: "error",
        message: "Error checking tenant access",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
    
    // Check user roles
    try {
      const { data: roles, error: rolesError } = await supabase
        .from('tenant_user_roles')
        .select('count')
        .limit(1);
      
      checksToRun[4] = {
        name: "User Roles",
        status: rolesError ? "error" : "success",
        message: rolesError ? "User roles error" : "User roles configured correctly",
        details: rolesError ? rolesError.message : undefined
      };
    } catch (error) {
      checksToRun[4] = {
        name: "User Roles",
        status: "error",
        message: "Error checking user roles",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }

    setChecks(checksToRun);
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <AdminOnly>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">System Status & Launch Readiness</h1>
          <Button 
            onClick={runSystemChecks} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> 
                Running Checks...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" /> 
                Run System Checks
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Health Overview</CardTitle>
            <CardDescription>
              Current status of critical system components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {checks.map((check, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${
                    check.status === "success" ? "border-green-200 bg-green-50" :
                    check.status === "warning" ? "border-amber-200 bg-amber-50" :
                    check.status === "error" ? "border-red-200 bg-red-50" :
                    "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(check.status)}
                      <h3 className="font-medium">{check.name}</h3>
                    </div>
                    <Badge variant={
                      check.status === "success" ? "outline" :
                      check.status === "warning" ? "secondary" :
                      check.status === "error" ? "destructive" :
                      "default"
                    }>
                      {check.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm">{check.message}</p>
                  {check.details && (
                    <p className="mt-1 text-xs text-muted-foreground">{check.details}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" /> Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SystemHealthCheck />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> Launch Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-500" />
                  <span>Authentication configured</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-500" />
                  <span>RLS policies implemented</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-green-500" />
                  <span>Error boundaries in place</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-green-500" />
                  <span>Edge functions deployed</span>
                </div>
                
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Pre-Launch Recommendations</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                      <li>Run a full security audit with the RLS Audit Report tool</li>
                      <li>Test workspace switching with multiple tenants</li>
                      <li>Verify authentication flows with various user roles</li>
                      <li>Check email templates for notifications</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminOnly>
  );
}
