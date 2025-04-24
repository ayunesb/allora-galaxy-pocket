
import { useLogFilters } from "./logs/useLogFilters";
import { useFilteredLogs } from "./logs/useFilteredLogs";
import { useLogPagination } from "./logs/useLogPagination";

export function useSystemLogsWithFilters() {
  const { filters, updateFilters } = useLogFilters();
  const { data: logs, isLoading, error, getRecentLogs } = useFilteredLogs(filters);
  const pagination = useLogPagination(logs?.length || 0);

  const setFilters = updateFilters;

  return {
    logs,
    isLoading,
    error,
    filters,
    setFilters,
    updateFilters,
    getRecentLogs,
    pagination
  };
}
