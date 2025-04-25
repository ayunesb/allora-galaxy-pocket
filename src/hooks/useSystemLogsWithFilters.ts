
import { useState, useCallback, useMemo } from 'react';
import { SystemLog } from '@/types/systemLog';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { useLogFilters } from '@/hooks/useLogFilters';
import { useLogPagination } from '@/hooks/useLogPagination';
import { toast } from 'sonner';
import { LogFilters } from '@/types/logFilters';

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
      const { data, error: fetchError } = await fetch('/api/logs?limit=' + limit)
        .then(res => res.json());
      
      if (fetchError) throw new Error(fetchError.message);
      
      setLogs(data || []);
      setError(null);
    } catch (err: any) {
      setError(err);
      toast.error('Error fetching logs', {
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get paginated logs
  const getPaginatedLogs = useCallback(() => {
    if (error) {
      toast.error('Error fetching logs', {
        description: error.message
      });
      return [];
    }

    const startIndex = (pagination.currentPage - 1) * pagination.logsPerPage;
    return filteredLogs.slice(startIndex, startIndex + pagination.logsPerPage);
  }, [error, filteredLogs, pagination.currentPage, pagination.logsPerPage]);

  return {
    logs: getPaginatedLogs(),
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
