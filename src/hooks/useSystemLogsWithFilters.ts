
import { useState, useEffect } from 'react';
import { useSystemLogs } from './useSystemLogs';
import { toast } from 'sonner';

type Filters = {
  searchTerm?: string;
  dateRange?: number;
  eventType?: string;
  userId?: string;
};

type PaginationState = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
};

export function useSystemLogsWithFilters() {
  const { logs: allLogs, getRecentLogs, isLogging, logSecurityEvent } = useSystemLogs();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    dateRange: 7,
    eventType: 'all',
    userId: 'all'
  });
  
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

  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1 when changing filters
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      dateRange: 7,
      eventType: 'all',
      userId: 'all'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      await getRecentLogs(100); // Fetch more logs for client-side filtering
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch system logs');
    } finally {
      setIsLoading(false);
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
    fetchLogs();
  }, []);

  return {
    logs,
    allLogs,
    isLoading,
    filters,
    updateFilters,
    resetFilters,
    fetchLogs,
    pagination,
    nextPage,
    prevPage,
    goToPage,
    logSecurityEvent,
    isLogging
  };
}
