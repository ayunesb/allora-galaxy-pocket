
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
      // Use the security definer function instead of directly querying
      const { data, error } = await supabase.rpc(
        "check_tenant_user_access", 
        { tenant_uuid: tenant.id, user_uuid: user.id }
      );
      
      if (error) {
        console.error('Error checking role access:', error);
        return false;
      }
      
      if (!data) {
        return false;
      }
      
      // Now safely get the role
      const { data: userRole, error: roleError } = await supabase
        .from('tenant_user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('tenant_id', tenant.id)
        .maybeSingle();
      
      if (roleError) {
        console.error('Error fetching role:', roleError);
        return false;
      }
      
      // Admin and owner roles have access to everything
      if (userRole?.role === 'admin' || userRole?.role === 'owner') return true;
      
      // For other roles, check specifically
      return userRole?.role === role;
    } catch (error) {
      console.error('Error checking role access:', error);
      return false;
    }
  }, [user?.id, tenant?.id]);
  
  return { checkAccess };
}
