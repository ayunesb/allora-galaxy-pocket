
import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/hooks/useTenant';

interface LogsFilterOptions {
  eventType?: string | null;
  sortDirection?: 'asc' | 'desc';
  startDate?: Date | null;
  endDate?: Date | null;
  userId?: string | null;
  searchTerm?: string;
  limit?: number;
}

interface SystemLog {
  id: string;
  event_type: string;
  message: string;
  user_id: string | null;
  tenant_id: string;
  created_at: string;
  meta?: Record<string, any> | null;
}

export function useLogsFilter(initialOptions: LogsFilterOptions = {}) {
  const { tenant } = useTenant();
  const [eventType, setEventType] = useState<string | null>(initialOptions.eventType || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialOptions.sortDirection || 'desc');
  const [startDate, setStartDate] = useState<Date | null>(initialOptions.startDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialOptions.endDate || null);
  const [userId, setUserId] = useState<string | null>(initialOptions.userId || null);
  const [searchTerm, setSearchTerm] = useState(initialOptions.searchTerm || '');
  const [limit, setLimit] = useState(initialOptions.limit || 100);
  
  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: ['system-logs', tenant?.id, eventType, sortDirection, startDate, endDate, userId, limit],
    queryFn: async () => {
      if (!tenant) return [];
      
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: sortDirection === 'asc' })
        .limit(limit);
      
      if (eventType) {
        query = query.eq('event_type', eventType);
      }
      
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as SystemLog[];
    },
    enabled: !!tenant,
  });
  
  const { data: eventTypes } = useQuery({
    queryKey: ['event-types', tenant?.id],
    queryFn: async () => {
      if (!tenant) return [];
      
      const { data, error } = await supabase
        .from('system_logs')
        .select('event_type')
        .eq('tenant_id', tenant.id);
      
      if (error) throw error;
      
      // Process the data to extract unique event types
      const uniqueEventTypes = Array.from(new Set(
        data.map(item => item.event_type).filter(Boolean)
      ));
      
      return uniqueEventTypes;
    },
    enabled: !!tenant,
  });
  
  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    
    return logs.filter(log => 
      !searchTerm || 
      log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.meta && JSON.stringify(log.meta).toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [logs, searchTerm]);
  
  const resetFilters = useCallback(() => {
    setEventType(null);
    setSortDirection('desc');
    setStartDate(null);
    setEndDate(null);
    setUserId(null);
    setSearchTerm('');
  }, []);
  
  return {
    logs: filteredLogs,
    eventTypes,
    isLoading,
    error,
    refetch,
    filters: {
      eventType,
      setEventType,
      sortDirection,
      setSortDirection,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      userId,
      setUserId,
      searchTerm,
      setSearchTerm,
      limit,
      setLimit,
    },
    resetFilters,
  };
}
