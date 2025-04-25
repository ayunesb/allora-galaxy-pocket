
import { useState, useCallback, useMemo } from 'react';
import { SystemLog } from '@/types/systemLog';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { useLogFilters } from '@/hooks/useLogFilters';
import { useLogPagination } from '@/hooks/useLogPagination';
import { ToastService } from '@/services/ToastService';
import { LogFilters } from '@/types/logFilters';

export function useSystemLogsWithFilters() {
  const { 
    logActivity, 
    logSecurityEvent, 
    verifyModuleImplementation,
    getRecentLogs, 
    logs, 
    isLoading, 
    error, 
    isLogging 
  } = useSystemLogs();
  
  const { filters, updateFilters, resetFilters, filteredLogs } = useLogFilters(logs ?? []);
  
  const pagination = useLogPagination({
    totalItems: filteredLogs.length
  });

  // Get paginated logs
  const getPaginatedLogs = useCallback(() => {
    if (error) {
      ToastService.error({
        title: "Error fetching logs",
        description: error.message
      });
      return [];
    }

    const startIndex = (pagination.currentPage - 1) * pagination.logsPerPage;
    return filteredLogs.slice(startIndex, startIndex + pagination.logsPerPage);
  }, [error, filteredLogs, pagination.currentPage, pagination.logsPerPage]);

  return {
    logs: getPaginatedLogs(),
    allLogs: logs || [],
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
