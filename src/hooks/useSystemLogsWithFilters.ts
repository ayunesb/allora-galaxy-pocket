
import { useLogFilters } from "./logs/useLogFilters";
import { useFilteredLogs } from "./logs/useFilteredLogs";
import { useLogPagination } from "./logs/useLogPagination";

export function useSystemLogsWithFilters() {
  const { filters, updateFilters } = useLogFilters();
  const { data: logs, isLoading, error } = useFilteredLogs(filters);
  const pagination = useLogPagination(logs?.length || 0);

  return {
    logs,
    isLoading,
    error,
    filters,
    updateFilters,
    pagination
  };
}
