
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { SystemLog } from '@/types/systemLog';

interface AdminLogsFilters {
  dateRange: number;
  eventType: string;
  userId: string;
  search: string;
}

export function useAdminLogs(initialFilters: AdminLogsFilters = {
  dateRange: 7,
  eventType: 'all',
  userId: 'all',
  search: ''
}) {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<AdminLogsFilters>(initialFilters);

  const refreshLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('system_logs').select('*');
      
      // Apply date range filter
      if (filters.dateRange > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filters.dateRange);
        query = query.gte('created_at', cutoffDate.toISOString());
      }
      
      // Apply event type filter
      if (filters.eventType !== 'all') {
        query = query.ilike('event_type', `%${filters.eventType}%`);
      }
      
      // Apply user ID filter
      if (filters.userId !== 'all') {
        query = query.eq('user_id', filters.userId);
      }
      
      // Always order by most recent
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Apply search filter client-side for more flexibility
      let filteredData = data || [];
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = filteredData.filter(log => 
          log.message.toLowerCase().includes(searchTerm) || 
          log.event_type.toLowerCase().includes(searchTerm) ||
          (log.meta && JSON.stringify(log.meta).toLowerCase().includes(searchTerm))
        );
      }
      
      setLogs(filteredData);
    } catch (error: any) {
      console.error('Error fetching admin logs:', error);
      toast.error('Failed to fetch system logs', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh logs when filters change
  useEffect(() => {
    refreshLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dateRange, filters.eventType, filters.userId]);

  // Only refresh when search changes and it's more than 3 characters or empty
  useEffect(() => {
    if (filters.search.length === 0 || filters.search.length > 2) {
      const debounceTimer = setTimeout(refreshLogs, 300);
      return () => clearTimeout(debounceTimer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  return {
    logs,
    isLoading,
    filters,
    setFilters,
    refreshLogs
  };
}
