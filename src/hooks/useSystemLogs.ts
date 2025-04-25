
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";
import { SystemLog } from '@/types/systemLog';

interface LogActivityParams {
  event_type: string;
  message: string;
  meta?: Record<string, any>;
  severity?: 'info' | 'warning' | 'error' | 'success';
}

export function useSystemLogs() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [isLogging, setIsLogging] = useState(false);

  /**
   * Log an activity to the system_logs table
   */
  const logActivity = async ({
    event_type,
    message,
    meta = {},
    severity = 'info'
  }: LogActivityParams): Promise<{ success: boolean; log?: SystemLog; error?: any }> => {
    if (!tenant?.id) {
      console.warn("Can't log activity: No tenant ID available");
      return { success: false, error: "No tenant ID" };
    }
    
    setIsLogging(true);
    
    try {
      // Prepare the log payload
      const logPayload = {
        tenant_id: tenant.id,
        event_type,
        message,
        meta: { ...meta, severity },
        user_id: user?.id
      };
      
      // Insert the log into the system_logs table
      const { data, error } = await supabase
        .from('system_logs')
        .insert(logPayload)
        .select()
        .single();
        
      if (error) throw error;
      
      return { success: true, log: data };
    } catch (err) {
      console.error("Failed to log activity:", err);
      return { success: false, error: err };
    } finally {
      setIsLogging(false);
    }
  };

  /**
   * Log an error to the system_logs table
   */
  const logError = async (
    message: string,
    error: Error | any,
    meta: Record<string, any> = {}
  ): Promise<{ success: boolean; log?: SystemLog; error?: any }> => {
    return logActivity({
      event_type: 'ERROR',
      message,
      meta: {
        ...meta,
        errorMessage: error.message,
        stack: error.stack,
        code: error.code
      },
      severity: 'error'
    });
  };

  /**
   * Log a security event to the system_logs table
   */
  const logSecurityEvent = async (
    message: string,
    eventType: string,
    meta: Record<string, any> = {}
  ): Promise<{ success: boolean; log?: SystemLog; error?: any }> => {
    return logActivity({
      event_type: `SECURITY_${eventType}`,
      message,
      meta,
      severity: 'warning'
    });
  };

  /**
   * Log a user journey transition
   */
  const logJourneyStep = async (
    from: string,
    to: string,
    details: Record<string, any> = {}
  ): Promise<{ success: boolean; log?: SystemLog; error?: any }> => {
    return logActivity({
      event_type: 'USER_JOURNEY',
      message: `User navigated from ${from} to ${to}`,
      meta: {
        from,
        to,
        ...details
      }
    });
  };
  
  return {
    logActivity,
    logError,
    logSecurityEvent,
    logJourneyStep,
    isLogging
  };
}

// Hook to fetch system logs with filtering and pagination
export function useSystemLogsWithFilters() {
  const { tenant } = useTenant();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  /**
   * Fetch logs with filtering and pagination
   */
  const fetchLogs = async ({
    page = 1,
    pageSize = 20,
    eventType = null,
    severity = null,
    startDate = null,
    endDate = null,
    searchTerm = null
  }: {
    page?: number;
    pageSize?: number;
    eventType?: string | null;
    severity?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    searchTerm?: string | null;
  } = {}) => {
    if (!tenant?.id) {
      console.warn("Can't fetch logs: No tenant ID available");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Start with the base query
      let query = supabase
        .from('system_logs')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenant.id);
      
      // Apply filters if provided
      if (eventType) {
        query = query.eq('event_type', eventType);
      }
      
      if (severity) {
        // Severity is stored in meta.severity
        query = query.contains('meta', { severity });
      }
      
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      
      if (searchTerm) {
        query = query.ilike('message', `%${searchTerm}%`);
      }
      
      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setLogs(data || []);
      setTotalCount(count || 0);
      
    } catch (err: any) {
      console.error("Failed to fetch logs:", err);
      setError(err.message || "Failed to fetch logs");
      toast("Error loading logs", {
        description: err.message || "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    logs,
    loading,
    error,
    totalCount,
    fetchLogs
  };
}

// Hook for pagination of logs
export function useLogPagination(initialPage = 1, initialPageSize = 20) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  const onPageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  const onPageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };
  
  return {
    page,
    pageSize,
    onPageChange,
    onPageSizeChange
  };
}
