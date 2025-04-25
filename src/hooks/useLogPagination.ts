
import { useState, useCallback } from 'react';
import { PaginationState } from '@/types/logFilters';

interface PaginationProps {
  totalItems: number;
  initialPage?: number;
  initialItemsPerPage?: number;
}

export function useLogPagination({ 
  totalItems, 
  initialPage = 1, 
  initialItemsPerPage = 10 
}: PaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [logsPerPage, setLogsPerPage] = useState(initialItemsPerPage);
  
  // Calculate total pages based on items and items per page
  const totalPages = Math.max(1, Math.ceil(totalItems / logsPerPage));
  
  // Ensure currentPage is within valid range when dependencies change
  useCallback(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalItems, logsPerPage, totalPages]);
  
  // Navigation functions
  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);
  
  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);
  
  const goToPage = useCallback((page: number) => {
    const targetPage = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(targetPage);
  }, [totalPages]);

  const pagination: PaginationState = {
    currentPage,
    totalPages,
    logsPerPage
  };
  
  return {
    currentPage,
    totalPages,
    logsPerPage,
    setLogsPerPage,
    nextPage,
    prevPage,
    goToPage,
    pagination
  };
}
