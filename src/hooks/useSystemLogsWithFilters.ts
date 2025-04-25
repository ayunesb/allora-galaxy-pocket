
import { useState, useCallback } from 'react';
import { SystemLog } from '@/types/systemLog';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { useLogFilters } from '@/hooks/useLogFilters';
import { useLogPagination } from '@/hooks/useLogPagination';
import { showToast } from '@/utils/toastUtils';
import { LogFilters, DEFAULT_FILTERS } from '@/types/logFilters';

export function useSystemLogsWithFilters() {
  const { logs: allLogs, isLoading, error, getRecentLogs } = useSystemLogs();
  const { filters, updateFilters, resetFilters, filteredLogs } = useLogFilters(allLogs);
  
  const pagination = useLogPagination({
    totalItems: filteredLogs.length
  });

  // Get paginated logs
  const getPaginatedLogs = useCallback(() => {
    if (error) {
      showToast({
        title: "Error fetching logs",
        description: error.message,
        variant: "destructive"
      });
      return [];
    }

    const startIndex = (pagination.currentPage - 1) * pagination.logsPerPage;
    return filteredLogs.slice(startIndex, startIndex + pagination.logsPerPage);
  }, [error, filteredLogs, pagination.currentPage, pagination.logsPerPage]);

  return {
    logs: getPaginatedLogs(),
    allLogs: allLogs || [],
    filters,
    pagination,
    isLoading,
    error,
    updateFilters,
    resetFilters,
    getRecentLogs,
    nextPage: pagination.nextPage,
    prevPage: pagination.prevPage,
    goToPage: pagination.goToPage,
    setLogsPerPage: pagination.setLogsPerPage
  };
}
