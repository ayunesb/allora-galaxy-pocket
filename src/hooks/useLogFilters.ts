
import { useState, useMemo } from 'react';
import { SystemLog } from '@/types/systemLog';
import { LogFilters, DEFAULT_FILTERS } from '@/types/logFilters';

export function useLogFilters(logs: SystemLog[]) {
  const [filters, setFilters] = useState<LogFilters>(DEFAULT_FILTERS);
  
  const updateFilters = (newFilters: Partial<LogFilters>) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };
  
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };
  
  // Apply filters to the logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Filter by search term
      if (filters.search && !log.message.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Filter by event type
      if (filters.eventType !== 'all' && log.event_type !== filters.eventType) {
        return false;
      }
      
      // Filter by severity
      if (filters.severity !== 'all' && log.severity !== filters.severity) {
        return false;
      }
      
      // Filter by service if it exists
      if (filters.service && log.service && log.service !== filters.service) {
        return false;
      }
      
      // Filter by date range
      if (filters.dateRange > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filters.dateRange);
        
        const logDate = new Date(log.created_at);
        if (logDate < cutoffDate) {
          return false;
        }
      }
      
      // Filter by user if specified
      if (filters.userId && log.user_id !== filters.userId) {
        return false;
      }
      
      return true;
    });
  }, [logs, filters]);
  
  return {
    filters,
    updateFilters,
    resetFilters,
    filteredLogs
  };
}
