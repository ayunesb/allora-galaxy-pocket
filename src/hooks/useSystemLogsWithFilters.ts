
import { useState } from "react";
import { useSystemLogs } from "@/hooks/useSystemLogs";

export type Log = {
  id: string;
  severity: string;
  service: string;
  timestamp: string | Date;
  message: string;
};

export interface LogFilter {
  search: string;
  dateRange: number;
  eventType: string;
  userId: string;
}

export function useSystemLogsWithFilters() {
  const { logs: initialLogs, isLoading, getRecentLogs } = useSystemLogs();
  const [filters, setFilters] = useState<LogFilter>({
    search: "",
    dateRange: 7,
    eventType: "all",
    userId: ""
  });

  // Filter logs based on the current filters
  const filteredLogs = initialLogs.filter(log => {
    // Filter by search text
    if (filters.search && !log.message.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Filter by event type
    if (filters.eventType !== "all" && log.event_type !== filters.eventType) {
      return false;
    }
    
    // Filter by user ID
    if (filters.userId && log.user_id !== filters.userId) {
      return false;
    }
    
    // Filter by date range (assuming timestamp is a string that can be parsed)
    if (filters.dateRange > 0) {
      const now = new Date();
      const cutoffDate = new Date();
      cutoffDate.setDate(now.getDate() - filters.dateRange);
      
      const logDate = new Date(log.timestamp);
      if (logDate < cutoffDate) {
        return false;
      }
    }
    
    return true;
  });

  // Pagination logic
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // Get paginated logs
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Function to update filters
  const updateFilters = (newFilters: Partial<LogFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Reset filters to default values
  const resetFilters = () => {
    setFilters({
      search: "",
      dateRange: 7,
      eventType: "all",
      userId: ""
    });
    setCurrentPage(1);
  };

  return {
    logs: paginatedLogs,
    setLogs: () => {}, // Placeholder, actual implementation relies on useSystemLogs
    filters,
    updateFilters,
    resetFilters,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    isLoading,
    getRecentLogs,
    pagination: { currentPage, totalPages, goToPage }
  };
}
