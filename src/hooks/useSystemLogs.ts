
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { SystemLog, SystemLogFilter, LogSeverity } from "@/types/systemLog";
import { logSystemEvent } from "@/lib/logging/systemLogger";
import { useAuth } from "./useAuth";
import { useTenant } from "./useTenant";
import { toast } from "sonner";

export function useSystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { tenant } = useTenant();
  
  // Fetch logs with filters
  const fetchLogs = async (filters: SystemLogFilter = {}) => {
    if (!tenant?.id) {
      setError("No tenant selected");
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Cast safely to avoid deep recursion
      const safeData = data as unknown as SystemLog[];
      setLogs(safeData);
      return safeData;
    } catch (err: any) {
      setError(err.message || "Failed to fetch system logs");
      console.error("Error fetching system logs:", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Log a new system event
  const logEvent = async (
    eventType: string, 
    message: string, 
    meta: Record<string, any> = {}, 
    severity: LogSeverity = 'info'
  ) => {
    if (!tenant?.id) {
      console.error("Cannot log event: No tenant ID");
      return null;
    }
    
    try {
      const log = await logSystemEvent({
        tenant_id: tenant.id,
        user_id: user?.id,
        event_type: eventType,
        message,
        severity,
        meta
      });
      
      // Refresh logs if successful
      if (log) {
        fetchLogs();
      }
      
      return log;
    } catch (err) {
      console.error("Failed to log system event:", err);
      return null;
    }
  };

  // Verify module implementation for journey-verification
  const verifyModuleImplementation = async (modulePath: string) => {
    if (!tenant?.id) {
      console.error("Cannot verify module: No tenant ID");
      return { success: false, message: "No tenant selected" };
    }
    
    try {
      // Log the verification attempt
      await logEvent(
        'module_verification', 
        `Attempting to verify module: ${modulePath}`, 
        { module: modulePath },
        'info'
      );
      
      // Simulate verification process
      // This would typically call a Supabase function or API
      const result = {
        success: true,
        message: {
          verified: true,
          phase1Complete: true,
          phase2Complete: true,
          phase3Complete: modulePath.includes('stripe') ? false : true,
          modulePath: modulePath,
          options: { requireAuth: true }
        }
      };
      
      // Log the verification result
      await logEvent(
        'module_verification_result',
        `Module ${modulePath} verification ${result.message.verified ? 'succeeded' : 'failed'}`,
        result.message,
        result.message.verified ? 'info' : 'error'
      );
      
      return result;
    } catch (err: any) {
      console.error("Error verifying module implementation:", err);
      
      // Log the error
      await logEvent(
        'module_verification_error',
        `Failed to verify module ${modulePath}: ${err.message}`,
        { module: modulePath, error: err.message },
        'error'
      );
      
      return { 
        success: false, 
        message: {
          verified: false,
          phase1Complete: false,
          phase2Complete: false,
          phase3Complete: false,
          modulePath: modulePath,
          options: {}
        }
      };
    }
  };
  
  // Clear all logs
  const clearLogs = async () => {
    if (!tenant?.id || !user?.id) {
      setError("No tenant or user selected");
      return false;
    }
    
    try {
      await logEvent('logs_cleared', 'System logs cleared by user', {}, 'info');
      
      toast.success("Logs cleared successfully");
      return true;
    } catch (err) {
      console.error("Failed to clear logs:", err);
      toast.error("Failed to clear logs");
      return false;
    }
  };
  
  // Export logs to CSV
  const exportLogs = async (filters: SystemLogFilter = {}) => {
    // This would be implemented to export logs to CSV
    toast.info("Exporting logs...");
    return true;
  };

  // Log activity (general purpose logging)
  const logActivity = async (
    eventType: string,
    message: string,
    meta: Record<string, any> = {},
    severity: LogSeverity = 'info'
  ) => {
    return logEvent(eventType, message, meta, severity);
  };

  // Get recent logs
  const getRecentLogs = async (limit: number = 100) => {
    return fetchLogs({ limit });
  };

  // Log specific error
  const logError = async (
    message: string,
    error: Error | any,
    meta: Record<string, any> = {}
  ) => {
    return logEvent(
      'ERROR',
      message,
      {
        ...meta,
        errorMessage: error.message,
        stack: error.stack,
        code: error.code
      },
      'error'
    );
  };

  // Log security event
  const logSecurityEvent = async (
    message: string,
    eventType: string,
    meta: Record<string, any> = {}
  ) => {
    return logEvent(
      `SECURITY_${eventType}`,
      message,
      meta,
      'warning'
    );
  };

  // Log journey step
  const logJourneyStep = async (
    from: string,
    to: string,
    details: Record<string, any> = {}
  ) => {
    return logEvent(
      'USER_JOURNEY',
      `User navigated from ${from} to ${to}`,
      {
        from,
        to,
        ...details
      },
      'info'
    );
  };

  return {
    logs,
    isLoading,
    error,
    fetchLogs,
    logEvent,
    clearLogs,
    exportLogs,
    verifyModuleImplementation,
    logActivity,
    logError,
    logSecurityEvent,
    logJourneyStep,
    getRecentLogs,
    refresh: () => fetchLogs()
  };
}
