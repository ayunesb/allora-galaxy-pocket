
import { useState, useEffect } from 'react';
import { useSystemLogs } from './useSystemLogs';
import { LogFilters, DEFAULT_FILTERS } from '@/types/logFilters';
import { toast } from 'sonner';

type PaginationState = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
};

export function useSystemLogsWithFilters() {
  const { 
    logs: allLogs, 
    fetchLogs, 
    isLoading, 
    logSecurityEvent,
    logActivity
  } = useSystemLogs();
  
  const [logs, setLogs] = useState<any[]>([]);
  const [filters, setFilters] = useState<LogFilters>(DEFAULT_FILTERS);
  
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10
  });

  useEffect(() => {
    applyFilters();
  }, [filters, allLogs]);

  const applyFilters = () => {
    let filteredData = [...allLogs];
    
    if (filters.eventType && filters.eventType !== 'all') {
      filteredData = filteredData.filter(log => 
        log.event_type?.toLowerCase().includes(filters.eventType?.toLowerCase() || '')
      );
    }
    
    if (filters.dateRange && filters.dateRange > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - (filters.dateRange || 7));
      filteredData = filteredData.filter(log => 
        new Date(log.created_at) >= cutoffDate
      );
    }
    
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredData = filteredData.filter(log => 
        log.message?.toLowerCase().includes(searchTerm) || 
        log.event_type?.toLowerCase().includes(searchTerm)
      );
    }
    
    const totalPages = Math.ceil(filteredData.length / pagination.pageSize);
    
    setPagination(prev => ({
      ...prev,
      totalPages: Math.max(1, totalPages),
      currentPage: Math.min(prev.currentPage, Math.max(1, totalPages))
    }));
    
    // Apply pagination
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const paginatedLogs = filteredData.slice(startIndex, startIndex + pagination.pageSize);
    
    setLogs(paginatedLogs);
  };

  const updateFilters = (newFilters: Partial<LogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1 when changing filters
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const fetchLogs100 = async () => {
    try {
      await fetchLogs({ limit: 100 }); // Fetch more logs for client-side filtering
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch system logs');
    }
  };

  // Pagination controls
  const nextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  };

  const prevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: page }));
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLogs100();
  }, []);

  return {
    logs,
    allLogs,
    isLoading,
    filters,
    updateFilters,
    resetFilters,
    fetchLogs: fetchLogs100,
    pagination,
    nextPage,
    prevPage,
    goToPage,
    logSecurityEvent,
    isLogging: false, // Added for compatibility
    logActivity // Added for page compatibility
  };
}
