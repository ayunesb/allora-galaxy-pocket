
import { useState } from 'react';
import { useTenant } from './useTenant';
import { supabase } from '@/integrations/supabase/client';
import { ToastService } from '@/services/ToastService';

export interface KpiAlert {
  id: string;
  tenant_id: string;
  kpi_name: string;
  metric?: string;
  description: string;
  current_value: number;
  previous_value?: number;
  percent_change?: number;
  threshold?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'acknowledged' | 'resolved' | 'dismissed';
  triggered_at: string;
  created_at: string;
  campaign_id?: string;
  message?: string;
  condition?: string;
}

export function useUnifiedKpiAlerts() {
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState<KpiAlert[]>([]);
  const { tenant } = useTenant();
  
  const fetchAlerts = async (options: { activeOnly?: boolean; limit?: number } = {}) => {
    if (!tenant?.id) {
      console.warn('No tenant selected when trying to fetch KPI alerts');
      return { data: [], error: 'No tenant selected' };
    }
    
    const { activeOnly = true, limit = 100 } = options;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('kpi_alerts')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('triggered_at', { ascending: false });
        
      if (activeOnly) {
        query = query.in('status', ['pending', 'acknowledged']);
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setAlerts(data as KpiAlert[]);
      return { data: data as KpiAlert[], error: null };
    } catch (error: any) {
      console.error('Error fetching KPI alerts:', error);
      return { data: [], error: error.message };
    } finally {
      setIsLoading(false);
    }
  };
  
  const acknowledgeAlert = async (alertId: string) => {
    if (!tenant?.id) {
      ToastService.error("No tenant selected");
      return { success: false };
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('kpi_alerts')
        .update({ status: 'acknowledged' })
        .eq('id', alertId)
        .eq('tenant_id', tenant.id);
        
      if (error) throw error;
      
      // Update local state
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
        )
      );
      
      ToastService.success("Alert acknowledged");
      return { success: true };
    } catch (error: any) {
      console.error('Error acknowledging alert:', error);
      ToastService.error(`Failed to acknowledge alert: ${error.message}`);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  const resolveAlert = async (alertId: string) => {
    if (!tenant?.id) {
      ToastService.error("No tenant selected");
      return { success: false };
    }
    
    setIsLoading(true);
    try {
      // Update the alert status
      const { error } = await supabase
        .from('kpi_alerts')
        .update({ status: 'resolved' })
        .eq('id', alertId)
        .eq('tenant_id', tenant.id);
        
      if (error) throw error;
      
      // Update local state
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, status: 'resolved' } : alert
        )
      );
      
      ToastService.success("Alert resolved");
      return { success: true };
    } catch (error: any) {
      console.error('Error resolving alert:', error);
      ToastService.error(`Failed to resolve alert: ${error.message}`);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  const dismissAlert = async (alertId: string) => {
    if (!tenant?.id) {
      ToastService.error("No tenant selected");
      return { success: false };
    }
    
    setIsLoading(true);
    try {
      // Update the alert status
      const { error } = await supabase
        .from('kpi_alerts')
        .update({ status: 'dismissed' })
        .eq('id', alertId)
        .eq('tenant_id', tenant.id);
        
      if (error) throw error;
      
      // Update local state
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      ToastService.success("Alert dismissed");
      return { success: true };
    } catch (error: any) {
      console.error('Error dismissing alert:', error);
      ToastService.error(`Failed to dismiss alert: ${error.message}`);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    alerts,
    isLoading,
    fetchAlerts,
    acknowledgeAlert,
    resolveAlert,
    dismissAlert
  };
}
