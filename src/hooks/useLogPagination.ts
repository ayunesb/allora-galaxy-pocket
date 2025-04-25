
import { useState, useMemo } from 'react';
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

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / logsPerPage));
  }, [totalItems, logsPerPage]);

  // Ensure current page is valid when data changes
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    currentPage,
    totalPages,
    logsPerPage,
    nextPage,
    prevPage,
    goToPage,
    setLogsPerPage
  } as PaginationState & {
    nextPage: () => void;
    prevPage: () => void;
    goToPage: (page: number) => void;
    setLogsPerPage: (count: number) => void;
  };
}
