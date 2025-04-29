
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useTenant } from './useTenant';

export function useResolveAlert() {
  const [isResolving, setIsResolving] = useState(false);
  const { toast } = useToast();
  const { tenant } = useTenant();

  const resolveAlert = async (alertId: string) => {
    if (!tenant?.id) {
      toast({
        title: "No tenant context",
        description: "Cannot resolve alert without a tenant context",
        variant: "destructive"
      });
      return false;
    }
    
    setIsResolving(true);
    try {
      // Using a direct update instead of a custom function
      const { error } = await supabase
        .from('kpi_alerts')
        .update({ 
          status: 'resolved', 
          outcome: 'manually_resolved',
          updated_at: new Date().toISOString() 
        })
        .eq('id', alertId)
        .eq('tenant_id', tenant.id); // Add tenant check for security

      if (error) throw error;

      // Log the resolution event
      await supabase.from('system_logs').insert({
        tenant_id: tenant.id,
        event_type: 'ALERT_RESOLVED',
        message: `KPI Alert (${alertId}) was manually resolved`,
        created_at: new Date().toISOString(),
        meta: { alert_id: alertId },
        severity: 'info' // Add severity field as required
      });

      toast({
        title: "Alert resolved",
        description: "The alert has been successfully resolved.",
      });

      return true;
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Failed to resolve alert",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsResolving(false);
    }
  };

  return { resolveAlert, isResolving };
}
