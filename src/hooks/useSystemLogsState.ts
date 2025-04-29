
import { useState } from 'react';
import { SystemLog, SystemLogFilter } from '@/types/systemLog';
import { useSystemLogs } from './useSystemLogs';

export function useSystemLogsState() {
  const [filters, setFilters] = useState<SystemLogFilter>({
    limit: 50,
    offset: 0
  });
  
  const { logs, isLoading, error, fetchLogs, refresh } = useSystemLogs();
  
  const updateFilters = (newFilters: Partial<SystemLogFilter>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset pagination when filters change
      offset: newFilters.hasOwnProperty('offset') ? newFilters.offset : 0
    }));
  };
  
  const nextPage = () => {
    setFilters(prev => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.limit || 50)
    }));
  };
  
  const prevPage = () => {
    setFilters(prev => ({
      ...prev,
      offset: Math.max(0, (prev.offset || 0) - (prev.limit || 50))
    }));
  };
  
  return {
    logs,
    loading: isLoading,
    error,
    filters,
    updateFilters,
    nextPage,
    prevPage,
    refresh: () => refresh()
  };
}
