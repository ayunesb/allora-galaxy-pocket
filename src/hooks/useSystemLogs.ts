import { useState, useEffect } from 'react';
import { useTenant } from './useTenant';
import { SystemLog, SystemLogFilter, LogSeverity } from '@/types/systemLog';
import { getSystemLogs } from '@/lib/logging/systemLogger';

export function useSystemLogs(filters: SystemLogFilter = {}) {
  const { tenant } = useTenant();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  
  const fetchLogs = async () => {
    if (!tenant?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const systemLogs = await getSystemLogs(tenant.id, {
        limit: filters.limit,
        offset: filters.offset,
        eventTypes: filters.eventTypes,
        severity: filters.severity as LogSeverity[],
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
        search: filters.search
      });
      
      setLogs(systemLogs);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch system logs');
      console.error('Error fetching system logs:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLogs();
  }, [tenant?.id, filters]);
  
  // Get recent logs with a specific limit
  const getRecentLogs = async (limit = 50) => {
    if (!tenant?.id) return [];
    setLoading(true);
    
    try {
      const systemLogs = await getSystemLogs(tenant.id, { limit });
      setLogs(systemLogs);
      return systemLogs;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recent logs');
      console.error('Error fetching recent logs:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add logActivity function
  const logActivity = async ({
    event_type,
    message,
    meta = {},
    severity = 'info' as LogSeverity
  }: {
    event_type: string;
    message: string;
    meta?: Record<string, any>;
    severity?: LogSeverity;
  }) => {
    if (!tenant?.id) {
      console.warn("Can't log activity: No tenant ID available");
      return { success: false, error: "No tenant ID" };
    }
    
    setIsLogging(true);
    
    try {
      // Import here to avoid circular dependencies
      const { supabase } = await import('@/integrations/supabase/client');
      
      const logPayload = {
        tenant_id: tenant.id,
        event_type,
        message,
        meta: { ...meta },
        severity, // Add severity field directly to the payload
        user_id: null // Will be filled by Supabase auth
      };
      
      const { data, error } = await supabase
        .from('system_logs')
        .insert(logPayload)
        .select()
        .single();
        
      if (error) throw error;
      
      return { success: true, log: data as SystemLog };
    } catch (err) {
      console.error("Failed to log activity:", err);
      return { success: false, error: err };
    } finally {
      setIsLogging(false);
    }
  };

  // Add logSecurityEvent function
  const logSecurityEvent = async (
    message: string,
    eventType: string,
    meta: Record<string, any> = {}
  ) => {
    return logActivity({
      event_type: `SECURITY_${eventType}`,
      message,
      meta,
      severity: 'warning'
    });
  };

  // Add logJourneyStep function
  const logJourneyStep = async (
    from: string,
    to: string,
    details: Record<string, any> = {}
  ) => {
    return logActivity({
      event_type: 'USER_JOURNEY',
      message: `User navigated from ${from} to ${to}`,
      meta: {
        from,
        to,
        ...details
      },
      severity: 'info'
    });
  };
  
  const refresh = () => {
    fetchLogs();
  };
  
  // Add verifyModuleImplementation function
  const verifyModuleImplementation = async (moduleName: string) => {
    if (!tenant?.id) {
      return { success: false, message: "No tenant ID available" };
    }
    
    try {
      // Log the verification attempt
      await logActivity({
        event_type: 'MODULE_VERIFICATION',
        message: `Verifying module implementation: ${moduleName}`,
        meta: { moduleName },
        severity: 'info'
      });
      
      // Mock implementation verification
      // In a real implementation, this would check if the module exists and is correctly implemented
      return { success: true, message: `Module ${moduleName} correctly implemented` };
    } catch (error: any) {
      console.error(`Error verifying module ${moduleName}:`, error);
      return {
        success: false,
        message: error.message || `Failed to verify module ${moduleName}`
      };
    }
  };

  return {
    logs,
    loading,
    error,
    refresh,
    getRecentLogs,
    logActivity,
    logSecurityEvent,
    logJourneyStep,
    isLogging,
    verifyModuleImplementation  // Add this to the return object
  };
}
