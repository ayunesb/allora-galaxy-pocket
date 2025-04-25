
import { useState, useCallback } from "react";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { SystemLog } from "@/types/systemLog";

type LogFilters = {
  search: string;
  dateRange: number; // in days
  eventType: string;
};

export function useSystemLogsWithFilters() {
  const { logs: allLogs, isLoading, getRecentLogs } = useSystemLogs();
  const [filters, setFilters] = useState<LogFilters>({
    search: "",
    dateRange: 7, // Default to last 7 days
    eventType: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  // Apply filters to logs
  const filteredLogs = useCallback(() => {
    if (!allLogs) return [];

    return allLogs.filter((log) => {
      // Filter by search term
      const searchMatch = !filters.search
        ? true
        : (log.message && log.message.toLowerCase().includes(filters.search.toLowerCase())) ||
          (log.event_type && log.event_type.toLowerCase().includes(filters.search.toLowerCase())) ||
          (log.service && log.service.toLowerCase().includes(filters.search.toLowerCase()));

      // Filter by event type
      const eventTypeMatch =
        filters.eventType === "all" ? true : log.event_type === filters.eventType;

      // Filter by date range
      const dateRangeMatch = !filters.dateRange
        ? true
        : new Date(log.timestamp || log.created_at) >=
          new Date(Date.now() - filters.dateRange * 24 * 60 * 60 * 1000);

      return searchMatch && eventTypeMatch && dateRangeMatch;
    });
  }, [allLogs, filters]);

  // Get paginated logs
  const getPaginatedLogs = useCallback(() => {
    const filtered = filteredLogs();
    const startIndex = (currentPage - 1) * logsPerPage;
    return filtered.slice(startIndex, startIndex + logsPerPage);
  }, [filteredLogs, currentPage]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredLogs().length / logsPerPage));

  // Update filters
  const updateFilters = useCallback(
    (newFilters: Partial<LogFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
      setCurrentPage(1); // Reset to first page when filters change
    },
    []
  );

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      dateRange: 7,
      eventType: "all",
    });
    setCurrentPage(1);
  }, []);

  // Pagination controls
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
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

  return {
    logs: getPaginatedLogs(),
    filters,
    updateFilters,
    resetFilters,
    isLoading,
    getRecentLogs,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
  };
}
