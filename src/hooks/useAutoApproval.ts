
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { toast } from 'sonner';
import { useSystemLogs } from './useSystemLogs';

export function useAutoApproval() {
  const { tenant, updateTenantProfile } = useTenant();
  const queryClient = useQueryClient();
  const { logActivity } = useSystemLogs();

  const toggleAutoApproval = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!tenant?.id) {
        throw new Error('No tenant selected');
      }

      // Update tenant_profiles
      await updateTenantProfile({
        enable_auto_approve: enabled
      });

      // Log the change
      await logActivity(
        'AUTO_APPROVAL_SETTING',
        `Auto-approval ${enabled ? 'enabled' : 'disabled'}`,
        { previous_state: tenant.enable_auto_approve, new_state: enabled },
        'info'
      );

      return enabled;
    },
    onSuccess: (enabled) => {
      toast.success(`Auto-approval ${enabled ? 'enabled' : 'disabled'}`);
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
    },
    onError: (error) => {
      console.error('Error updating auto-approval setting:', error);
      toast.error('Failed to update auto-approval setting');
    }
  });

  return {
    autoApproveEnabled: tenant?.enable_auto_approve ?? false,
    toggleAutoApproval: toggleAutoApproval.mutate
  };
}
