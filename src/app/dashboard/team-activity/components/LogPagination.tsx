
import React from 'react';
import { Pagination } from '@/components/ui/pagination';

interface LogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function LogPagination({ currentPage, totalPages, onPageChange }: LogPaginationProps) {
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onPreviousPage={handlePrevPage}
      onNextPage={handleNextPage}
    />
  );
}
