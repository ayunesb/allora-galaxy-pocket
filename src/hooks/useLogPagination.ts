
import { useState } from 'react';

interface LogPaginationProps {
  totalItems: number;
  initialPage?: number;
  initialLogsPerPage?: number;
}

export function useLogPagination({
  totalItems,
  initialPage = 1,
  initialLogsPerPage = 10
}: LogPaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [logsPerPage, setLogsPerPage] = useState(initialLogsPerPage);
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalItems / logsPerPage));
  
  // Navigate to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Navigate to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Go to a specific page
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
  };
}
