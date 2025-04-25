
import { useState, useCallback, useMemo, useEffect } from "react";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { SystemLog } from "@/types/systemLog";

export type LogSeverity = 'info' | 'warning' | 'error';

export interface LogFilters {
  search: string;
  dateRange: number; // in days
  eventType: string;
  severity?: LogSeverity | 'all';
  service?: string;
  userId?: string;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  logsPerPage: number;
}

export interface UseSystemLogsWithFiltersReturn {
  logs: SystemLog[];
  allLogs: SystemLog[];
  filters: LogFilters;
  pagination: PaginationState;
  isLoading: boolean;
  error: Error | null;
  updateFilters: (newFilters: Partial<LogFilters>) => void;
  resetFilters: () => void;
  getRecentLogs: () => Promise<void>;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setLogsPerPage: (count: number) => void;
  availableServices: string[];
  availableEventTypes: string[];
}

const DEFAULT_FILTERS: LogFilters = {
  search: "",
  dateRange: 7, // Default to last 7 days
  eventType: "all",
  severity: "all",
  service: undefined,
  userId: undefined,
};

export function useSystemLogsWithFilters(): UseSystemLogsWithFiltersReturn {
  const { logs: allLogs, isLoading, error, getRecentLogs } = useSystemLogs();
  const [filters, setFilters] = useState<LogFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(10);

  // Extract unique services and event types for filter options
  const availableServices = useMemo(() => {
    if (!allLogs) return [];
    const services = new Set<string>();
    allLogs.forEach(log => {
      if (log.service) {
        services.add(log.service);
      }
    });
    return Array.from(services).sort();
  }, [allLogs]);

  const availableEventTypes = useMemo(() => {
    if (!allLogs) return [];
    const eventTypes = new Set<string>();
    allLogs.forEach(log => {
      if (log.event_type) {
        eventTypes.add(log.event_type);
      }
    });
    return Array.from(eventTypes).sort();
  }, [allLogs]);

  // Apply filters to logs
  const filteredLogs = useMemo(() => {
    if (!allLogs) return [];

    return allLogs.filter(log => {
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
  }, [allLogs, filters]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / logsPerPage));

  // Get paginated logs
  const getPaginatedLogs = useCallback(() => {
    const startIndex = (currentPage - 1) * logsPerPage;
    return filteredLogs.slice(startIndex, startIndex + logsPerPage);
  }, [filteredLogs, currentPage, logsPerPage]);

  // Make sure current page is valid after filter changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Update filters
  const updateFilters = useCallback(
    (newFilters: Partial<LogFilters>) => {
      setFilters(prev => ({ ...prev, ...newFilters }));
      setCurrentPage(1); // Reset to first page when filters change
    },
    []
  );

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  }, []);

  // Pagination controls
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const changeLogsPerPage = useCallback((count: number) => {
    setLogsPerPage(count);
    setCurrentPage(1); // Reset to first page when changing logs per page
  }, []);

  return {
    logs: getPaginatedLogs(),
    allLogs: allLogs || [],
    filters,
    pagination: {
      currentPage,
      totalPages,
      logsPerPage
    },
    isLoading,
    error,
    updateFilters,
    resetFilters,
    getRecentLogs,
    nextPage,
    prevPage,
    goToPage,
    setLogsPerPage: changeLogsPerPage,
    availableServices,
    availableEventTypes
  };
}
