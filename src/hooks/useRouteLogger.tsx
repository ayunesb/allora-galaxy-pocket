
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useTenant } from './useTenant';

export function useRouteLogger() {
  const location = useLocation();
  const { user } = useAuth();
  const { tenant } = useTenant();

  useEffect(() => {
    const logRoute = async () => {
      if (!user?.id) return;
      
      try {
        // Get user role if available
        const { data: userRoleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
          
        const role = userRoleData?.role || 'unknown';
        
        // Log the route with tenant_id if available
        await supabase
          .from('route_logs')
          .insert({
            user_id: user.id,
            role: role,
            route: location.pathname,
            tenant_id: tenant?.id || '00000000-0000-0000-0000-000000000000' // Default UUID if tenant not available
          });
      } catch (error) {
        console.error('Error logging route:', error);
        // Silent failure - don't interrupt user experience for analytics
      }
    };
    
    logRoute();
  }, [location.pathname, user?.id, tenant?.id]);
  
  return null; // This hook doesn't return anything
}
