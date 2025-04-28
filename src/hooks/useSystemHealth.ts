
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SystemHealthResult {
  isHealthy: boolean;
  issues: string[];
  lastChecked: Date;
  performCheck: () => Promise<void>;
  isChecking: boolean;
}

export function useSystemHealth(): SystemHealthResult {
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [issues, setIssues] = useState<string[]>([]);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const performCheck = async () => {
    setIsChecking(true);
    setIssues([]);
    
    try {
      // Check database connectivity
      const { error: dbError } = await supabase.from('system_logs').select('id').limit(1);
      if (dbError) {
        setIssues(prev => [...prev, `Database connectivity issue: ${dbError.message}`]);
        setIsHealthy(false);
        toast.error("Database connection issues detected", {
          description: "Please check your connection or try again"
        });
      }

      // Check authentication
      const { error: authError } = await supabase.auth.getSession();
      if (authError) {
        setIssues(prev => [...prev, `Authentication issue: ${authError.message}`]);
        setIsHealthy(false);
        toast.error("Authentication service issues detected");
      }

      // Check for tenant health
      const { tenant } = await import('@/hooks/useTenant');
      if (!tenant?.id) {
        setIssues(prev => [...prev, "No active tenant selected"]);
      }

      if (issues.length === 0) {
        setIsHealthy(true);
      }

      setLastChecked(new Date());
    } catch (error: any) {
      setIsHealthy(false);
      setIssues(prev => [...prev, `System check failed: ${error.message}`]);
      toast.error("System health check failed");
      console.error("System health check error:", error);
    } finally {
      setIsChecking(false);
    }
  };

  // Run initial health check on mount
  useEffect(() => {
    performCheck();
    // Schedule periodic health checks every 5 minutes
    const intervalId = setInterval(performCheck, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  return {
    isHealthy,
    issues,
    lastChecked,
    performCheck,
    isChecking
  };
}
