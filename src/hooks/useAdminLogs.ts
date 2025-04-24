
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SystemLog } from '@/types/systemLog';
import { toast } from 'sonner';

export function useAdminLogs(filters: {
  dateRange: number;
  eventType: string;
  userId: string;
  search: string;
}) {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial logs
  useEffect(() => {
    fetchLogs();
  }, [filters]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('system_logs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_logs',
        },
        (payload) => {
          setLogs((currentLogs) => [payload.new as SystemLog, ...currentLogs]);
          toast.info('New system log received');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - filters.dateRange);

      let query = supabase
        .from('system_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (filters.eventType !== 'all') {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters.userId !== 'all') {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.search) {
        query = query.ilike('message', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch system logs');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    logs,
    isLoading,
    refreshLogs: fetchLogs
  };
}
