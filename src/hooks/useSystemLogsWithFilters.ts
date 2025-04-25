
import { useState, useCallback, useMemo } from 'react';
import { SystemLog } from '@/types/systemLog';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { useLogFilters } from '@/hooks/useLogFilters';
import { useLogPagination } from '@/hooks/useLogPagination';
import { ToastService } from '@/services/ToastService';
import { supabase } from '@/integrations/supabase/client';

export function useSystemLogsWithFilters() {
  const { 
    logActivity, 
    logSecurityEvent, 
    verifyModuleImplementation,
    isLogging 
  } = useSystemLogs();
  
  // Local state for logs since useSystemLogs doesn't provide them directly
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { filters, updateFilters, resetFilters, filteredLogs } = useLogFilters(logs);
  
  const pagination = useLogPagination({
    totalItems: filteredLogs.length
  });

  // Fetch recent logs
  const getRecentLogs = useCallback(async (limit: number = 100) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      setLogs(data || []);
      setError(null);
    } catch (err: any) {
      setError(err);
      ToastService.error({
        title: 'Error fetching logs',
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get paginated logs
  const getPaginatedLogs = useMemo(() => {
    if (!filteredLogs.length) return [];

    const startIndex = (pagination.currentPage - 1) * pagination.logsPerPage;
    return filteredLogs.slice(startIndex, startIndex + pagination.logsPerPage);
  }, [filteredLogs, pagination.currentPage, pagination.logsPerPage]);

  return {
    logs: getPaginatedLogs,
    allLogs: logs,
    filters,
    pagination,
    isLoading,
    error,
    updateFilters,
    resetFilters,
    getRecentLogs,
    logActivity,
    logSecurityEvent,
    verifyModuleImplementation,
    isLogging,
    nextPage: pagination.nextPage,
    prevPage: pagination.prevPage,
    goToPage: pagination.goToPage,
    setLogsPerPage: pagination.setLogsPerPage
  };
}
