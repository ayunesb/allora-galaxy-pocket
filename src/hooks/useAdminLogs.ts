
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { SystemLog } from '@/types/agent';

interface UseAdminLogsParams {
  limit?: number;
  eventTypes?: string[];
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export function useAdminLogs({
  limit = 50,
  eventTypes = [],
  startDate,
  endDate,
  searchTerm
}: UseAdminLogsParams = {}) {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { tenant } = useTenant();
  
  useEffect(() => {
    async function fetchLogs() {
      if (!tenant?.id) return;

      setIsLoading(true);

      try {
        let query = supabase
          .from('system_logs')
          .select('*')
          .eq('tenant_id', tenant.id);

        // Apply filters
        if (eventTypes.length > 0) {
          query = query.in('event_type', eventTypes);
        }
        
        if (startDate) {
          query = query.gte('created_at', startDate);
        }
        
        if (endDate) {
          query = query.lte('created_at', endDate);
        }
        
        if (searchTerm) {
          query = query.or(`message.ilike.%${searchTerm}%,event_type.ilike.%${searchTerm}%`);
        }
        
        // Order and limit
        query = query
          .order('created_at', { ascending: false })
          .limit(limit);
        
        const { data, error: apiError } = await query;
        
        if (apiError) throw apiError;
        
        // Convert to SystemLog type with required fields
        const typedLogs: SystemLog[] = data.map(log => ({
          id: log.id,
          event_type: log.event_type,
          message: log.message,
          meta: log.meta,
          tenant_id: log.tenant_id,
          user_id: log.user_id,
          created_at: log.created_at,
          severity: 'info' // Default severity if not available
        }));
        
        setLogs(typedLogs);
        setError(null);
      } catch (err) {
        console.error('Error fetching admin logs:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch logs'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchLogs();
  }, [tenant, limit, eventTypes, startDate, endDate, searchTerm]);

  return { logs, isLoading, error };
}
