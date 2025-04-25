
import { useState, useCallback } from 'react';

interface PaginationOptions {
  totalItems: number;
  initialPage?: number;
  itemsPerPage?: number;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  logsPerPage: number;
}

export function useLogPagination({ 
  totalItems, 
  initialPage = 1, 
  itemsPerPage = 10 
}: PaginationOptions) {
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: initialPage,
    totalPages: Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    logsPerPage: itemsPerPage
  });

  // Update pagination when items count changes
  if (totalItems !== (pagination.totalPages * pagination.logsPerPage)) {
    const newTotalPages = Math.max(1, Math.ceil(totalItems / pagination.logsPerPage));
    if (newTotalPages !== pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        totalPages: newTotalPages,
        // Reset to page 1 if current page is beyond the new total
        currentPage: prev.currentPage > newTotalPages ? 1 : prev.currentPage
      }));
    }
  }

  const nextPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      currentPage: Math.min(prev.currentPage + 1, prev.totalPages)
    }));
  }, []);

  const prevPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      currentPage: Math.max(prev.currentPage - 1, 1)
    }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, prev.totalPages))
    }));
  }, []);

  const setLogsPerPage = useCallback((count: number) => {
    setPagination(prev => {
      const newTotalPages = Math.max(1, Math.ceil(totalItems / count));
      return {
        currentPage: 1, // Reset to first page when changing items per page
        totalPages: newTotalPages,
        logsPerPage: count
      };
    });
  }, [totalItems]);

  return {
    ...pagination,
    nextPage,
    prevPage,
    goToPage,
    setLogsPerPage
  };
}
