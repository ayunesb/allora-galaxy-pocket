
import { useState, useCallback, useMemo } from 'react';
import { SystemLog } from '@/types/systemLog';
import { LogFilters, DEFAULT_FILTERS } from '@/types/logFilters';

export function useLogFilters(logs: SystemLog[] = []) {
  const [filters, setFilters] = useState<LogFilters>(DEFAULT_FILTERS);

  const updateFilters = useCallback((newFilters: Partial<LogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Apply filters to logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Filter by search term
      const searchMatch = !filters.search
        ? true
        : (log.message && log.message.toLowerCase().includes(filters.search.toLowerCase())) ||
          (log.event_type && log.event_type.toLowerCase().includes(filters.search.toLowerCase())) ||
          (log.service && log.service.toLowerCase().includes(filters.search.toLowerCase()));

      // Filter by event type
      const eventTypeMatch =
        filters.eventType === "all" ? true : log.event_type === filters.eventType;

      // Filter by severity
      const severityMatch = 
        !filters.severity || filters.severity === "all" 
          ? true 
          : log.severity === filters.severity;

      // Filter by service
      const serviceMatch = 
        !filters.service 
          ? true 
          : log.service === filters.service;

      // Filter by user ID
      const userIdMatch = 
        !filters.userId 
          ? true 
          : log.user_id === filters.userId;

      // Filter by date range
      const dateRangeMatch = !filters.dateRange
        ? true
        : new Date(log.timestamp || log.created_at) >=
          new Date(Date.now() - filters.dateRange * 24 * 60 * 60 * 1000);

      return searchMatch && eventTypeMatch && dateRangeMatch && 
             severityMatch && serviceMatch && userIdMatch;
    });
  }, [logs, filters]);

  return {
    filters,
    updateFilters,
    resetFilters,
    filteredLogs
  };
}
