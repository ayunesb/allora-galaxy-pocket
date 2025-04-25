
import { useLogFilters } from "@/hooks/logs/useLogFilters";
import { useFilteredLogs } from "@/hooks/logs/useFilteredLogs";
import { useLogPagination } from "@/hooks/logs/useLogPagination";

export function useSystemLogsWithFilters() {
  const { filters, updateFilters, clearFilters } = useLogFilters();
  const { data: logs, isLoading, error, getRecentLogs } = useFilteredLogs(filters);
  const pagination = useLogPagination(logs?.length || 0);
  
  // Create a setFilters method for backwards compatibility
  const setFilters = updateFilters;

  return {
    logs,
    isLoading,
    error,
    filters,
    setFilters,
    updateFilters,
    clearFilters,
    getRecentLogs,
    pagination
  };
}
