import { useState } from "react";
import { useLogFilters } from "@/hooks/logs/useLogFilters";
import { useFilteredLogs } from "@/hooks/logs/useFilteredLogs";
import { useLogPagination } from "@/hooks/logs/useLogPagination";

export type Log = {
  id: string;
  severity: string;
  service: string;
  timestamp: string | Date;
  message: string;
};

export function useSystemLogsWithFilters(initialLogs: Log[]) {
  const [logs, setLogs] = useState<Log[]>(initialLogs);
  const { filters, updateFilters, resetFilters } = useLogFilters();
  const filteredLogs = useFilteredLogs(logs, filters);
  const { currentPage, totalPages, nextPage, prevPage, goToPage, paginatedItems } = useLogPagination(filteredLogs.length, 10);

  const paginatedLogs = paginatedItems(filteredLogs);

  return {
    logs: paginatedLogs,
    setLogs,
    filters,
    updateFilters,
    resetFilters,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage
  };
}
