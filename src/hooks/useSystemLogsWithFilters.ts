
import { useState, useEffect } from "react";
import { useSystemLogs } from "./useSystemLogs";
import { SystemLog } from "@/types/systemLog";

export function useSystemLogsWithFilters() {
  const { logs: allLogs, isLoading, getRecentLogs } = useSystemLogs();
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [filters, setFilters] = useState({
    dateRange: "7",
    eventType: "all",
    search: "",
  });

  const logsPerPage = 10;
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  useEffect(() => {
    const filtered = allLogs.filter((log) => {
      const matchesSearch = !filters.search || 
        log.message.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.event_type.toLowerCase().includes(filters.search.toLowerCase());
        
      const matchesEventType = filters.eventType === "all" || 
        log.event_type === filters.eventType;

      return matchesSearch && matchesEventType;
    });

    setFilteredLogs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [allLogs, filters]);

  const currentLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  return {
    logs: currentLogs,
    isLoading,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    allLogs,
    getRecentLogs
  };
}
