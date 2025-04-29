
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { toast } from 'sonner';
import { useSystemLogs } from './useSystemLogs';

interface KpiMetric {
  id: string;
  metric: string;
  value: number;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  recorded_at: string;
}

interface AddKpiParams {
  metric: string;
  value: number;
  recorded_at?: string;
}

export function useKpiMetrics() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const { logActivity } = useSystemLogs();

  // Fetch KPI metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['kpi-metrics', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      // Safely cast data to avoid deep recursion
      const safeData = data as unknown as KpiMetric[];
      return safeData;
    },
    enabled: !!tenant?.id
  });

  // Add a new KPI metric
  const addKpi = useMutation({
    mutationFn: async ({ metric, value, recorded_at }: AddKpiParams) => {
      if (!tenant?.id) throw new Error('No tenant selected');
      
      setIsUpdating(true);
      
      const newMetric = {
        tenant_id: tenant.id,
        metric: metric.trim(),
        value,
        recorded_at: recorded_at || new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('kpi_metrics')
        .insert(newMetric)
        .select()
        .single();
        
      if (error) throw error;
      
      // Log the activity
      await logActivity(
        'kpi_added',
        `New KPI "${metric}" added with value ${value}`,
        {
          metric,
          value,
          recorded_at
        },
        'info'
      );
      
      return data;
    },
    onSuccess: () => {
      toast.success('KPI metric added successfully');
      queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
    },
    onError: (error) => {
      console.error('Error adding KPI metric:', error);
      toast.error('Failed to add KPI metric');
    },
    onSettled: () => {
      setIsUpdating(false);
    }
  });

  // Update existing KPI metric
  const updateKpi = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: number }) => {
      if (!tenant?.id) throw new Error('No tenant selected');
      
      setIsUpdating(true);
      
      const { error, data } = await supabase
        .from('kpi_metrics')
        .update({
          value,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('tenant_id', tenant.id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Log the activity
      await logActivity(
        'kpi_updated',
        `KPI "${(data as any).metric}" updated to ${value}`,
        {
          kpi_id: id,
          new_value: value,
          old_value: metrics?.find(m => m.id === id)?.value
        },
        'info'
      );
      
      return data;
    },
    onSuccess: () => {
      toast.success('KPI metric updated successfully');
      queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
    },
    onError: (error) => {
      console.error('Error updating KPI metric:', error);
      toast.error('Failed to update KPI metric');
    },
    onSettled: () => {
      setIsUpdating(false);
    }
  });

  // Delete KPI metric
  const deleteKpi = useMutation({
    mutationFn: async (id: string) => {
      if (!tenant?.id) throw new Error('No tenant selected');
      
      setIsUpdating(true);
      
      const metricToDelete = metrics?.find(m => m.id === id);
      
      const { error } = await supabase
        .from('kpi_metrics')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenant.id);
        
      if (error) throw error;
      
      // Log the activity
      await logActivity(
        'kpi_deleted',
        `KPI "${metricToDelete?.metric || 'Unknown'}" deleted`,
        {
          kpi_id: id,
          metric_name: metricToDelete?.metric
        },
        'warning'
      );
      
      return true;
    },
    onSuccess: () => {
      toast.success('KPI metric deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
    },
    onError: (error) => {
      console.error('Error deleting KPI metric:', error);
      toast.error('Failed to delete KPI metric');
    },
    onSettled: () => {
      setIsUpdating(false);
    }
  });

  // Return cleaned up metrics with namespace
  const getMetricsByNamespace = () => {
    if (!metrics) return {};
    
    const namespaces: Record<string, KpiMetric[]> = {};
    
    metrics.forEach(metric => {
      const parts = metric.metric.split('.');
      const namespace = parts.length > 1 ? parts[0] : 'general';
      
      if (!namespaces[namespace]) {
        namespaces[namespace] = [];
      }
      
      namespaces[namespace].push(metric);
    });
    
    return namespaces;
  };

  return {
    metrics: metrics || [],
    metricsByNamespace: getMetricsByNamespace(),
    isLoading,
    isUpdating,
    addKpi: addKpi.mutate,
    updateKpi: updateKpi.mutate,
    deleteKpi: deleteKpi.mutate,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] })
  };
}
