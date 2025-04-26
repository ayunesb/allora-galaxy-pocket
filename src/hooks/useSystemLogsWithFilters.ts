
import { useState, useEffect } from 'react';
import { useSystemLogs } from './useSystemLogs';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';

export function useSystemLogsWithFilters() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();
  
  // Initialize with empty implementations that will be properly set up
  const logSecurityEvent = async (message: string, eventType: string, meta?: any) => {
    return logActivity({
      event_type: 'SECURITY_' + eventType,
      message,
      meta,
      severity: 'warning'
    });
  };
  
  const isLogging = false;

  const fetchLogs = async () => {
    if (!tenant) return;
    setLoading(true);
    
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }
      
      if (filters.startDate && filters.endDate) {
        query = query
          .gte('created_at', filters.startDate)
          .lte('created_at', filters.endDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (tenant?.id) {
      fetchLogs();
    }
  }, [tenant?.id, filters]);
  
  return {
    logs,
    loading,
    setFilters,
    fetchLogs,
    logSecurityEvent,
    isLogging
  };
}
