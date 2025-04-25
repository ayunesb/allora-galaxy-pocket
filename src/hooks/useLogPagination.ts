
import { useState, useCallback } from 'react';
import { PaginationState } from '@/types/logFilters';

interface UseLogPaginationProps {
  totalItems: number;
  initialPage?: number;
  initialLogsPerPage?: number;
}

export function useLogPagination({ 
  totalItems, 
  initialPage = 1, 
  initialLogsPerPage = 10 
}: UseLogPaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [logsPerPage, setLogsPerPage] = useState(initialLogsPerPage);

  // Calculate the total number of pages
  const totalPages = Math.max(1, Math.ceil(totalItems / logsPerPage));

  // Ensure current page is valid when total items or logs per page changes
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const updateLogsPerPage = useCallback((count: number) => {
    setLogsPerPage(count);
    // Reset to first page when changing items per page
    setCurrentPage(1);
  }, []);

  const paginationState: PaginationState = {
    currentPage,
    totalPages,
    logsPerPage
  };

  return {
    ...paginationState,
    nextPage,
    prevPage,
    goToPage,
    setLogsPerPage: updateLogsPerPage
  };
}
