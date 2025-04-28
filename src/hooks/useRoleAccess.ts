
import { useCallback } from 'react';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

/**
 * Hook for checking if a user has a specific role within the current tenant
 * Uses the security definer functions to avoid RLS recursion
 */
export function useRoleAccess() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  
  const checkAccess = useCallback(async (role: string): Promise<boolean> => {
    if (!user?.id || !tenant?.id) return false;
    
    try {
      // First verify tenant access using security definer function
      const { data: hasAccess, error: accessError } = await supabase.rpc(
        "check_tenant_user_access_safe", 
        { tenant_uuid: tenant.id, user_uuid: user.id }
      );
      
      if (accessError) {
        console.error('Error checking tenant access:', accessError);
        return false;
      }
      
      if (!hasAccess) return false;
      
      // Get user's role in tenant using security definer function
      const { data: userRole, error: roleError } = await supabase.rpc(
        "get_user_role_for_tenant",
        { user_uuid: user.id, tenant_uuid: tenant.id }
      );
      
      if (roleError) {
        console.error('Error getting user role:', roleError);
        return false;
      }
      
      // Admin role has access to everything
      if (userRole === 'admin') return true;
      
      // For other roles, check specifically
      return userRole === role;
    } catch (error) {
      console.error('Error checking role access:', error);
      toast(`Error checking permissions: ${(error as Error).message || 'Unknown error'}`);
      return false;
    }
  }, [user?.id, tenant?.id]);
  
  return { checkAccess };
}
