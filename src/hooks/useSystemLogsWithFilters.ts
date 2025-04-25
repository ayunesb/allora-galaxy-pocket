
import { SystemLog } from '@/types/systemLog';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { useLogFilters } from '@/hooks/useLogFilters';
import { useLogPagination } from '@/hooks/useLogPagination';
import { ToastService } from '@/services/toast';

export function useSystemLogsWithFilters() {
  const { logs: allLogs, isLoading, error, getRecentLogs } = useSystemLogs();
  const { filters, updateFilters, resetFilters, filteredLogs } = useLogFilters(allLogs);
  
  const pagination = useLogPagination({
    totalItems: filteredLogs.length
  });

  // Get paginated logs
  const getPaginatedLogs = () => {
    if (error) {
      ToastService.error({
        title: "Error fetching logs",
        description: error.message
      });
      return [];
    }

    const startIndex = (pagination.currentPage - 1) * pagination.logsPerPage;
    return filteredLogs.slice(startIndex, startIndex + pagination.logsPerPage);
  };

  return {
    logs: getPaginatedLogs(),
    allLogs: allLogs || [],
    filters,
    pagination,
    isLoading,
    error,
    updateFilters,
    resetFilters,
    getRecentLogs,
    nextPage: pagination.nextPage,
    prevPage: pagination.prevPage,
    goToPage: pagination.goToPage,
    setLogsPerPage: pagination.setLogsPerPage
  };
}
