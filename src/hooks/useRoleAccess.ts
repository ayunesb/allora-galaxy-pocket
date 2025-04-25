
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';

export function useRoleAccess() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  
  /**
   * Check if the current user has a specific role
   * @param role The role to check for
   * @returns Promise resolving to true if user has the role, false otherwise
   */
  const checkAccess = useCallback(async (role: string): Promise<boolean> => {
    // If no user or tenant, no access
    if (!user?.id || !tenant?.id) return false;
    
    try {
      // Check for admin role which has all permissions
      const { data: isAdmin } = await supabase.rpc('is_admin');
      if (isAdmin) return true;
      
      // Check for tenant-specific role
      const { data: userRole } = await supabase.rpc('get_user_role_for_tenant', {
        user_uuid: user.id,
        tenant_uuid: tenant.id
      });
      
      if (!userRole) return false;
      
      // Admin and owner roles have access to everything
      if (userRole === 'admin' || userRole === 'owner') return true;
      
      // For other roles, check specifically
      return userRole === role;
    } catch (error) {
      console.error('Error checking role access:', error);
      return false;
    }
  }, [user?.id, tenant?.id]);
  
  return { checkAccess };
}
