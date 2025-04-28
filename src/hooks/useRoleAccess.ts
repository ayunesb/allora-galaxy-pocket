
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';

export function useRoleAccess() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  
  const checkAccess = useCallback(async (role: string): Promise<boolean> => {
    if (!user?.id || !tenant?.id) return false;
    
    try {
      // Use the security definer function to check access
      const { data: hasAccess, error } = await supabase.rpc(
        "check_tenant_user_access",
        { tenant_uuid: tenant.id, user_uuid: user.id }
      );
      
      if (error) {
        console.error('Error checking role access:', error);
        return false;
      }
      
      if (!hasAccess) return false;
      
      // Get the user's role safely
      const { data: userRole } = await supabase.rpc(
        "get_user_role_for_tenant",
        { user_uuid: user.id, tenant_uuid: tenant.id }
      );
      
      // Admin role has access to everything
      if (userRole === 'admin') return true;
      
      // For other roles, check specifically
      return userRole === role;
    } catch (error) {
      console.error('Error checking role access:', error);
      return false;
    }
  }, [user?.id, tenant?.id]);
  
  return { checkAccess };
}
