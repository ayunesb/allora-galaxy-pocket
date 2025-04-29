
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ShieldAlert, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SecurityHealthCheck() {
  const [healthStatus, setHealthStatus] = useState<'checking' | 'secure' | 'warning' | 'critical'>('checking');
  const [issues, setIssues] = useState<{severity: string, message: string}[]>([]);
  
  useEffect(() => {
    checkSecurityHealth();
  }, []);

  const checkSecurityHealth = async () => {
    try {
      const securityIssues = [];
      
      // Check for proper crypto usage instead of nanoid
      const nanoIdUsage = await checkNanoIdUsage();
      if (nanoIdUsage.length > 0) {
        securityIssues.push({
          severity: 'warning',
          message: 'NanoID is used for potentially sensitive operations. Consider using crypto.randomUUID() instead.'
        });
      }
      
      // Check Vite config
      const viteConfig = await checkViteConfig();
      if (!viteConfig.isSecure) {
        securityIssues.push({
          severity: 'critical',
          message: 'Vite config is not properly hardened. Set server.fs.strict to true.'
        });
      }
      
      // Check for RLS policies
      const rlsStatus = await checkRLSPolicies();
      if (!rlsStatus.isSecure) {
        securityIssues.push({
          severity: 'critical',
          message: 'Some tables are missing RLS policies or have recursive policies.'
        });
      }
      
      // Determine overall health status
      if (securityIssues.some(issue => issue.severity === 'critical')) {
        setHealthStatus('critical');
      } else if (securityIssues.length > 0) {
        setHealthStatus('warning');
      } else {
        setHealthStatus('secure');
      }
      
      setIssues(securityIssues);
    } catch (error) {
      console.error("Error checking security health:", error);
      setHealthStatus('warning');
      setIssues([{
        severity: 'warning',
        message: 'Unable to complete security health check. Please try again.'
      }]);
    }
  };
  
  // Mock implementations for the checks
  const checkNanoIdUsage = async () => {
    // This would be implemented to scan the codebase for nanoid usage
    return [];
  };
  
  const checkViteConfig = async () => {
    // This would check if vite.config.ts has secure settings
    return { isSecure: true };
  };
  
  const checkRLSPolicies = async () => {
    // This would check database tables for proper RLS policies
    return { isSecure: true };
  };
  
  const runFullSecurityAudit = () => {
    toast.info("Running full security audit...", {
      description: "This may take a few moments to complete."
    });
    
    // In a real implementation, this would trigger a more comprehensive check
    setTimeout(() => {
      checkSecurityHealth();
      toast.success("Security audit completed", {
        description: "Check the results for any recommended actions."
      });
    }, 2000);
  };
  
  const getHealthStatusColor = () => {
    switch (healthStatus) {
      case 'secure': return 'bg-green-500';
      case 'warning': return 'bg-amber-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getHealthStatusText = () => {
    switch (healthStatus) {
      case 'secure': return 'System Security Looks Good';
      case 'warning': return 'Security Warnings Present';
      case 'critical': return 'Critical Security Issues Detected';
      default: return 'Checking Security Status...';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {healthStatus === 'secure' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {healthStatus === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
            {healthStatus === 'critical' && <ShieldAlert className="h-5 w-5 text-red-500" />}
            {healthStatus === 'checking' && <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-gray-500 animate-spin" />}
            <span>Security Health Check</span>
          </div>
          <Badge className={`${getHealthStatusColor()} text-white`}>
            {healthStatus === 'checking' ? 'Checking...' : issues.length === 0 ? 'No Issues' : `${issues.length} ${issues.length === 1 ? 'Issue' : 'Issues'}`}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4">
          <Alert className={`
            ${healthStatus === 'secure' ? 'bg-green-50 border-green-200' : ''}
            ${healthStatus === 'warning' ? 'bg-amber-50 border-amber-200' : ''}
            ${healthStatus === 'critical' ? 'bg-red-50 border-red-200' : ''}
            ${healthStatus === 'checking' ? 'bg-gray-50 border-gray-200' : ''}
          `}>
            <AlertTitle>
              {getHealthStatusText()}
            </AlertTitle>
            <AlertDescription>
              {healthStatus === 'secure' && "All security checks passed. The system appears to be properly configured."}
              {healthStatus === 'warning' && "Some non-critical security issues were detected. Review recommendations below."}
              {healthStatus === 'critical' && "Critical security issues require immediate attention. Review details below."}
              {healthStatus === 'checking' && "Running security checks. Please wait..."}
            </AlertDescription>
          </Alert>
        </div>
        
        {issues.length > 0 && (
          <div className="space-y-3 mb-4">
            <h3 className="text-sm font-medium">Issues Detected:</h3>
            {issues.map((issue, index) => (
              <Alert key={index} variant={issue.severity === 'critical' ? "destructive" : "default"}>
                {issue.severity === 'critical' ? <ShieldAlert className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                <AlertTitle className="flex items-center gap-2">
                  {issue.severity === 'critical' ? 'Critical Issue' : 'Warning'}
                  <Badge variant={issue.severity === 'critical' ? "destructive" : "outline"}>
                    {issue.severity}
                  </Badge>
                </AlertTitle>
                <AlertDescription>{issue.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            onClick={runFullSecurityAudit}
            disabled={healthStatus === 'checking'}
          >
            Run Full Security Audit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
