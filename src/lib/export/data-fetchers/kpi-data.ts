
import { supabase } from '@/integrations/supabase/client';
import { ExportFilters } from '../types';

export interface KpiData {
  current: {
    metric: string;
    value: number;
    recorded_at: string;
  }[];
  history: {
    metric: string;
    value: number;
    recorded_at: string;
  }[];
}

export async function fetchKpiData(filters: ExportFilters): Promise<KpiData> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (filters.dateRange || 7));
  
  const { data, error } = await supabase
    .from('kpi_metrics')
    .select('*')
    .eq('tenant_id', filters.tenantId)
    .gte('created_at', startDate.toISOString());
  
  if (error) {
    console.error('Error fetching KPI data:', error);
    throw error;
  }
  
  const { data: historyData, error: historyError } = await supabase
    .from('kpi_metrics_history')
    .select('*')
    .eq('tenant_id', filters.tenantId)
    .gte('recorded_at', startDate.toISOString())
    .order('recorded_at', { ascending: false });
    
  if (historyError) {
    console.error('Error fetching KPI history data:', historyError);
  }
  
  return {
    current: data || [],
    history: historyData || []
  };
}

