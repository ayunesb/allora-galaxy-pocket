
import { supabase } from '@/integrations/supabase/client';
import { ExportFilters } from '../types';

export async function fetchCampaignData(filters: ExportFilters): Promise<any[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (filters.dateRange || 7));
  
  let query = supabase
    .from('campaigns')
    .select(`
      id,
      name,
      description,
      status,
      scripts,
      created_at,
      updated_at
    `)
    .eq('tenant_id', filters.tenantId)
    .gte('created_at', startDate.toISOString());
  
  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching campaign data:', error);
    throw error;
  }
  
  return data || [];
}

