import { useState } from "react";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { SystemLog as BaseSystemLog } from "@/types/systemLog";

export interface SystemLog extends BaseSystemLog {
  id: string;
  severity: string;
  service: string;
  timestamp: string | Date;
  message: string;
  event_type?: string;
  user_id?: string;
}

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

  const filteredLogs = initialLogs.filter(log => {
    if (filters.search && !log.message.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    if (filters.eventType !== "all" && log.event_type !== filters.eventType) {
      return false;
    }
    
    if (filters.userId && log.user_id !== filters.userId) {
      return false;
    }
    
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
  
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const updateFilters = (newFilters: Partial<LogFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

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
    setLogs: () => {},
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
