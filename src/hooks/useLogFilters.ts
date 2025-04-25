
import { useState, useEffect, useMemo } from 'react';
import { SystemLog } from '@/types/systemLog';
import { LogFilters, DEFAULT_FILTERS } from '@/types/logFilters';
import { subDays } from 'date-fns';

export function useLogFilters(logs: SystemLog[]) {
  const [filters, setFilters] = useState<LogFilters>(DEFAULT_FILTERS);

  // Apply filters to logs
  const filteredLogs = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    
    return logs.filter(log => {
      // Apply search filter
      if (filters.search && !log.message.toLowerCase().includes(filters.search.toLowerCase()) && 
          !log.event_type.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Apply event type filter
      if (filters.eventType !== 'all' && log.event_type !== filters.eventType) {
        return false;
      }
      
      // Apply severity filter
      if (filters.severity !== 'all' && log.severity !== filters.severity) {
        return false;
      }

      // Apply service filter
      if (filters.service && filters.service !== 'all' && log.service !== filters.service) {
        return false;
      }
      
      // Apply date range filter
      if (filters.dateRange > 0) {
        const cutoffDate = subDays(new Date(), filters.dateRange);
        const logDate = new Date(log.created_at);
        if (logDate < cutoffDate) {
          return false;
        }
      }
      
      // Apply user filter
      if (filters.userId && log.user_id !== filters.userId) {
        return false;
      }
      
      return true;
    });
  }, [logs, filters]);

  const updateFilters = (newFilters: Partial<LogFilters>) => {
    setFilters(current => ({ ...current, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return {
    filters,
    updateFilters,
    resetFilters,
    filteredLogs
  };
}
