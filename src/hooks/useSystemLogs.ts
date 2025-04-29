
import { useState, useEffect } from 'react';
import { useTenant } from './useTenant';
import { SystemLog, SystemLogFilter } from '@/types/systemLog';
import { getSystemLogs } from '@/lib/logging/systemLogger';

export function useSystemLogs(filters: SystemLogFilter = {}) {
  const { tenant } = useTenant();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchLogs = async () => {
    if (!tenant?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const systemLogs = await getSystemLogs(tenant.id, {
        limit: filters.limit,
        offset: filters.offset,
        eventTypes: filters.eventTypes,
        severity: filters.severity as any[],
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
        search: filters.search
      });
      
      setLogs(systemLogs);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch system logs');
      console.error('Error fetching system logs:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLogs();
  }, [tenant?.id, filters]);
  
  const refresh = () => {
    fetchLogs();
  };
  
  return {
    logs,
    loading,
    error,
    refresh
  };
}
