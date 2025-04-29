
import { useState } from 'react';
import { SystemLog } from '@/types/agent';
import { LogFilters, DEFAULT_FILTERS } from '@/types/logFilters';
import { useSystemLogsState } from './useSystemLogsState';

export function useSystemLogsWithFilters() {
  const [filters, setFilters] = useState<LogFilters>(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1
  });

  // Create our own state with the missing properties
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { logActivity } = useSystemLogsState();

  // Define our own fetchLogs function
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // Implementation for fetching logs would go here
      // For now, return empty array
      setLogs([]);
      setPagination({
        currentPage: 1,
        totalPages: 1
      });
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<LogFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const nextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  };

  const prevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: page }));
    }
  };

  return {
    logs,
    filters,
    isLoading,
    updateFilters,
    resetFilters,
    fetchLogs,
    pagination,
    nextPage,
    prevPage,
    goToPage,
    logActivity
  };
}
