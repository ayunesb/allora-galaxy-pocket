
import { useState, useMemo } from 'react';
import { SystemLog } from '@/types/systemLog';
import { LogFilters, DEFAULT_FILTERS } from '@/types/logFilters';

export function useLogFilters(logs: SystemLog[]) {
  const [filters, setFilters] = useState<LogFilters>(DEFAULT_FILTERS);

  // Apply filters to logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Filter by event type
      if (filters.eventType && filters.eventType !== 'all' && log.event_type !== filters.eventType) {
        return false;
      }

      // Filter by severity
      if (filters.severity && filters.severity !== null) {
        // Safely access severity field
        const logSeverity = log.severity || 'info';
        if (logSeverity !== filters.severity) {
          return false;
        }
      }

      // Filter by date range
      if (filters.dateRange) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filters.dateRange);
        const logDate = new Date(log.created_at);
        
        if (logDate < cutoffDate) {
          return false;
        }
      }

      // Filter by specific date range if set
      if (filters.dateFrom && filters.dateTo) {
        const logDate = new Date(log.created_at);
        const dateFrom = new Date(filters.dateFrom);
        const dateTo = new Date(filters.dateTo);
        
        if (logDate < dateFrom || logDate > dateTo) {
          return false;
        }
      }

      // Filter by user ID
      if (filters.userId && filters.userId !== 'all' && log.user_id !== filters.userId) {
        return false;
      }

      // Filter by tenant ID
      if (filters.tenantId && filters.tenantId !== 'all' && log.tenant_id !== filters.tenantId) {
        return false;
      }

      // Check for service if it exists in the meta data
      if (filters.service && filters.service !== 'all') {
        const meta = log.meta as any;
        const service = meta?.service;
        if (!service || service !== filters.service) {
          return false;
        }
      }

      // Search through text fields
      if (filters.searchTerm || filters.search) {
        const searchText = (filters.searchTerm || filters.search || '').toLowerCase();
        if (searchText) {
          const messageMatch = log.message.toLowerCase().includes(searchText);
          const eventMatch = log.event_type.toLowerCase().includes(searchText);
          const metaMatch = log.meta ? JSON.stringify(log.meta).toLowerCase().includes(searchText) : false;
          
          if (!messageMatch && !eventMatch && !metaMatch) {
            return false;
          }
        }
      }

      return true;
    });
  }, [logs, filters]);

  // Update filters
  const updateFilters = (newFilters: Partial<LogFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Reset filters to default
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
