
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { useAuth } from './useAuth';

export function useRoleAccess() {
  const { tenant } = useTenant();
  const { user } = useAuth();

  const checkAccess = useCallback(async (requiredRole?: string): Promise<boolean> => {
    if (!user?.id || !tenant?.id) return false;

    try {
      if (!requiredRole) {
        // Just check tenant access
        const { data: hasAccess, error } = await supabase.rpc(
          'check_tenant_role_permission',
          { _user_id: user.id, _tenant_id: tenant.id }
        );
        if (error) throw error;
        return !!hasAccess;
      }

      // Check specific role
      const { data: role, error } = await supabase.rpc(
        'get_user_role_for_tenant',
        { user_uuid: user.id, tenant_uuid: tenant.id }
      );
      if (error) throw error;
      
      // Admin role has access to everything
      if (role === 'admin') return true;
      
      return role === requiredRole;
    } catch (err) {
      console.error('Error checking role access:', err);
      return false;
    }
  }, [user?.id, tenant?.id]);

  return { checkAccess };
}
