
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ExportFilters } from '../types';

export async function fetchStrategyData(filters: ExportFilters): Promise<any[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (filters.dateRange || 7));
  
  let query = supabase
    .from('vault_strategies')
    .select(`
      id,
      title,
      description,
      industry,
      goal,
      confidence,
      status,
      created_at,
      updated_at
    `)
    .eq('tenant_id', filters.tenantId)
    .gte('created_at', startDate.toISOString());
  
  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching strategy data:', error);
    throw error;
  }
  
  return data || [];
}

