
import { useSystemLogs } from "./useSystemLogs";
import { useLogFilters } from "./logs/useLogFilters";
import { useFilteredLogs } from "./logs/useFilteredLogs";
import { useLogPagination } from "./logs/useLogPagination";

export function useSystemLogsWithFilters() {
  const { logs: allLogs, isLoading, getRecentLogs } = useSystemLogs();
  const { filters, updateFilters } = useLogFilters();
  
  const filteredLogs = useFilteredLogs(allLogs, filters);
  const {
    currentPage,
    totalPages,
    currentLogs,
    goToNextPage,
    goToPrevPage,
    goToPage,
    resetPage
  } = useLogPagination(filteredLogs, { logsPerPage: 15 });

  return {
    logs: currentLogs,
    isLoading,
    filters,
    setFilters: updateFilters,
    currentPage,
    totalPages,
    allLogs,
    getRecentLogs,
    pagination: {
      goToNextPage,
      goToPrevPage,
      goToPage,
      currentPage,
      totalPages,
      resetPage
    }
  };
}
