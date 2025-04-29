
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SystemLog, SystemLogFilter, LogSeverity } from '@/types/systemLog';
import { useTenant } from './useTenant';

interface UseSystemLogsOptions {
  filter?: SystemLogFilter;
  enabled?: boolean;
}

export const useSystemLogs = ({ filter = {}, enabled = true }: UseSystemLogsOptions = {}) => {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ['system-logs', tenant?.id, filter],
    queryFn: async () => {
      if (!tenant?.id) {
        return [];
      }

      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenant.id);

      // Apply filters if provided
      if (filter.startDate) {
        query = query.gte('created_at', filter.startDate.toISOString());
      }

      if (filter.endDate) {
        query = query.lte('created_at', filter.endDate.toISOString());
      }

      if (filter.eventTypes && filter.eventTypes.length > 0) {
        query = query.in('event_type', filter.eventTypes);
      }

      if (filter.severity && filter.severity.length > 0) {
        query = query.in('severity', filter.severity);
      }

      if (filter.userId) {
        query = query.eq('user_id', filter.userId);
      }

      if (filter.search) {
        query = query.ilike('message', `%${filter.search}%`);
      }

      // Apply limit and offset
      if (filter.limit) {
        query = query.limit(filter.limit);
      }

      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
      }

      // Order by created_at descending
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch system logs: ${error.message}`);
      }

      // Cast data to prevent recursive type issues
      const safeData = data as unknown;
      return safeData as SystemLog[];
    },
    enabled: !!tenant?.id && enabled
  });
};

export const useTenantSystemLogTypes = () => {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ['system-log-types', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) {
        return [];
      }

      const { data, error } = await supabase
        .from('system_logs')
        .select('event_type')
        .eq('tenant_id', tenant.id)
        .order('event_type')
        .distinct();

      if (error) {
        throw new Error(`Failed to fetch system log types: ${error.message}`);
      }

      // Use explicit typing to avoid recursion
      return (data as Array<{event_type: string}>).map(item => item.event_type);
    },
    enabled: !!tenant?.id
  });
};

export const useSystemLogMetrics = ({ severity, days = 30 }: { severity?: LogSeverity; days?: number } = {}) => {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ['system-log-metrics', tenant?.id, severity, days],
    queryFn: async () => {
      if (!tenant?.id) {
        return { total: 0, byType: {}, byDay: [] };
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Base query
      let query = supabase
        .from('system_logs')
        .select('event_type, created_at', { count: 'exact' })
        .eq('tenant_id', tenant.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Apply severity filter if provided
      if (severity) {
        query = query.eq('severity', severity);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch system log metrics: ${error.message}`);
      }

      // Process data for metrics
      const typeCounts: Record<string, number> = {};
      const dayCounts: Record<string, number> = {};

      // Cast data to avoid excessive type depth
      const safeData = data as unknown as Array<{event_type: string, created_at: string}>;

      safeData.forEach(log => {
        // Count by type
        typeCounts[log.event_type] = (typeCounts[log.event_type] || 0) + 1;

        // Count by day
        const day = log.created_at.split('T')[0];
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });

      // Convert day counts to array for charts
      const byDay = Object.entries(dayCounts).map(([date, count]) => ({
        date,
        count
      }));

      return {
        total: count || 0,
        byType: typeCounts,
        byDay
      };
    },
    enabled: !!tenant?.id
  });
};
