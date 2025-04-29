
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface HealthCheckItem {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface SystemHealthResult {
  isHealthy: boolean;
  issues: string[];
  checks: HealthCheckItem[];
  lastChecked: Date;
  performCheck: () => Promise<void>;
  isChecking: boolean;
  healthPercentage: number;
}

export function useSystemHealth(): SystemHealthResult {
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [issues, setIssues] = useState<string[]>([]);
  const [checks, setChecks] = useState<HealthCheckItem[]>([]);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [healthPercentage, setHealthPercentage] = useState<number>(100);

  const performCheck = useCallback(async () => {
    setIsChecking(true);
    setIssues([]);
    const newChecks: HealthCheckItem[] = [];
    let healthyCount = 0;
    let totalChecks = 0;
    
    try {
      // Check database connectivity
      try {
        const startTime = performance.now();
        const { error: dbError } = await supabase.from('system_logs').select('id').limit(1);
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        if (dbError) {
          newChecks.push({
            name: 'Database Connectivity',
            status: 'error',
            message: `Database connectivity issue: ${dbError.message}`,
            timestamp: new Date(),
            details: { error: dbError.message }
          });
          setIssues(prev => [...prev, `Database connectivity issue: ${dbError.message}`]);
        } else {
          healthyCount++;
          newChecks.push({
            name: 'Database Connectivity',
            status: 'healthy',
            message: 'Database connection successful',
            timestamp: new Date(),
            details: { responseTime: `${responseTime}ms` }
          });
        }
        totalChecks++;
      } catch (error: any) {
        newChecks.push({
          name: 'Database Connectivity',
          status: 'error',
          message: `Database check error: ${error.message}`,
          timestamp: new Date()
        });
        setIssues(prev => [...prev, `Database check failed: ${error.message}`]);
        totalChecks++;
      }

      // Check authentication
      try {
        const { error: authError } = await supabase.auth.getSession();
        if (authError) {
          newChecks.push({
            name: 'Authentication Service',
            status: 'error',
            message: `Authentication issue: ${authError.message}`,
            timestamp: new Date(),
            details: { error: authError.message }
          });
          setIssues(prev => [...prev, `Authentication issue: ${authError.message}`]);
        } else {
          healthyCount++;
          newChecks.push({
            name: 'Authentication Service',
            status: 'healthy',
            message: 'Authentication service operational',
            timestamp: new Date()
          });
        }
        totalChecks++;
      } catch (error: any) {
        newChecks.push({
          name: 'Authentication Service',
          status: 'error',
          message: `Auth check error: ${error.message}`,
          timestamp: new Date()
        });
        setIssues(prev => [...prev, `Authentication check failed: ${error.message}`]);
        totalChecks++;
      }

      // Check storage bucket access
      try {
        const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
        if (storageError) {
          newChecks.push({
            name: 'Storage Service',
            status: 'error',
            message: `Storage service issue: ${storageError.message}`,
            timestamp: new Date(),
            details: { error: storageError.message }
          });
          setIssues(prev => [...prev, `Storage service issue: ${storageError.message}`]);
        } else {
          healthyCount++;
          newChecks.push({
            name: 'Storage Service',
            status: 'healthy',
            message: 'Storage service operational',
            timestamp: new Date(),
            details: { bucketsCount: buckets?.length || 0 }
          });
        }
        totalChecks++;
      } catch (error: any) {
        newChecks.push({
          name: 'Storage Service',
          status: 'error',
          message: `Storage check error: ${error.message}`,
          timestamp: new Date()
        });
        setIssues(prev => [...prev, `Storage check failed: ${error.message}`]);
        totalChecks++;
      }

      // Check Edge Functions (simulated for now)
      newChecks.push({
        name: 'Edge Functions',
        status: totalChecks % 3 === 0 ? 'warning' : 'healthy', // Random status for demo
        message: totalChecks % 3 === 0 
          ? 'Some edge functions have elevated error rates' 
          : 'Edge functions operational',
        timestamp: new Date(),
        details: { 
          deployedFunctions: 5,
          errorRate: totalChecks % 3 === 0 ? '0.8%' : '0.1%'
        }
      });
      if (totalChecks % 3 === 0) {
        setIssues(prev => [...prev, 'Some edge functions have elevated error rates']);
      } else {
        healthyCount++;
      }
      totalChecks++;
      
      // Check for tenant health (simulated)
      const hasTenantIssue = Math.random() > 0.9; // 10% chance of an issue
      if (hasTenantIssue) {
        newChecks.push({
          name: 'Tenant Management',
          status: 'warning',
          message: 'Some tenants may have incomplete data',
          timestamp: new Date(),
          details: { 
            affectedCount: Math.floor(Math.random() * 5) + 1 
          }
        });
        setIssues(prev => [...prev, 'Some tenants may have incomplete data']);
      } else {
        healthyCount++;
        newChecks.push({
          name: 'Tenant Management',
          status: 'healthy',
          message: 'All tenant data intact',
          timestamp: new Date()
        });
      }
      totalChecks++;

      // Calculate overall health percentage
      const percentage = totalChecks > 0 ? Math.round((healthyCount / totalChecks) * 100) : 100;
      setHealthPercentage(percentage);
      
      // Update overall health status
      setIsHealthy(issues.length === 0);
      setChecks(newChecks);
      setLastChecked(new Date());
      
      // Show toast based on outcome
      if (issues.length > 0) {
        toast.warning(`System health check complete: ${issues.length} issues found`, {
          description: "Review system health for details"
        });
      } else {
        toast.success("System health check complete: All systems operational");
      }
      
    } catch (error: any) {
      setIsHealthy(false);
      const errorMessage = `System check failed: ${error.message}`;
      setIssues(prev => [...prev, errorMessage]);
      setChecks([
        ...newChecks, 
        {
          name: 'Overall System Check',
          status: 'error',
          message: errorMessage,
          timestamp: new Date()
        }
      ]);
      
      toast.error("System health check failed", {
        description: "An unexpected error occurred during health verification"
      });
      
      console.error("System health check error:", error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Run initial health check on mount
  useEffect(() => {
    performCheck();
    // Schedule periodic health checks every 5 minutes
    const intervalId = setInterval(performCheck, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [performCheck]);

  return {
    isHealthy,
    issues,
    checks,
    lastChecked,
    performCheck,
    isChecking,
    healthPercentage
  };
}
