
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { useToast } from '@/hooks/use-toast';

export function useAutoApproval() {
  const { tenant } = useTenant();
  const { toast } = useToast();

  const toggleAutoApproval = useCallback(async (enabled: boolean) => {
    if (!tenant?.id) return;

    try {
      const { error } = await supabase
        .from('tenant_profiles')
        .update({ enable_auto_approve: enabled })
        .eq('id', tenant.id);

      if (error) throw error;

      toast({
        title: "Auto-approval settings updated",
        description: `AI auto-approval is now ${enabled ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      console.error('Error updating auto-approval settings:', error);
      toast({
        title: "Error",
        description: "Failed to update auto-approval settings",
        variant: "destructive"
      });
    }
  }, [tenant?.id, toast]);

  const checkAutoApproval = useCallback(async (strategyId: string) => {
    if (!tenant?.id || !strategyId) return;

    try {
      const { data, error } = await supabase.functions.invoke('auto-approve-strategy', {
        body: { strategy_id: strategyId, tenant_id: tenant.id }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Strategy Auto-approved",
          description: `Triggered by: ${data.trigger === 'mql_drop' ? 'MQL drop' : 'Agent feedback'}`
        });
      }

      return data;
    } catch (error) {
      console.error('Error checking auto-approval:', error);
      return null;
    }
  }, [tenant?.id, toast]);

  return { toggleAutoApproval, checkAutoApproval };
}
