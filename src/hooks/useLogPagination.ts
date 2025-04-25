
import { useState, useCallback } from 'react';

interface UseLogPaginationProps {
  totalItems: number;
  itemsPerPage?: number;
}

export function useLogPagination({ totalItems, itemsPerPage = 10 }: UseLogPaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(itemsPerPage);
  
  const totalPages = Math.max(1, Math.ceil(totalItems / logsPerPage));

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

  const changeItemsPerPage = useCallback((count: number) => {
    setLogsPerPage(count);
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    logsPerPage,
    nextPage,
    prevPage,
    goToPage,
    setLogsPerPage: changeItemsPerPage
  };
}
