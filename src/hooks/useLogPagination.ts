
import { useState, useMemo, useCallback } from 'react';

interface LogPaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
}

export function useLogPagination({
  totalItems,
  itemsPerPage = 10,
  initialPage = 1
}: LogPaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [logsPerPage, setLogsPerPage] = useState(itemsPerPage);
  
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / logsPerPage));
  }, [totalItems, logsPerPage]);
  
  // Ensure current page stays valid when totalPages changes
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1 && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);
  
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
  
  const goToPage = useCallback((pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  }, [totalPages]);
  
  return {
    currentPage,
    totalPages,
    logsPerPage,
    setLogsPerPage,
    nextPage,
    prevPage,
    goToPage
  };
}
