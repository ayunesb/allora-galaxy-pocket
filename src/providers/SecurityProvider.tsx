
import React, { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";

interface SecurityProviderProps {
  children: ReactNode;
}

/**
 * SecurityProvider ensures that security features are enabled app-wide
 * It doesn't render any UI but adds important security hooks to the app
 */
export function SecurityProvider({ children }: SecurityProviderProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { tenant } = useTenant();
  
  // Log route access for audit purposes
  useEffect(() => {
    // Only monitor routes for authenticated users with a tenant
    if (!user?.id || !tenant?.id) return;
    
    const logRouteAccess = async () => {
      try {
        // Log route access
        await supabase
          .from('route_logs')
          .insert({
            user_id: user.id,
            tenant_id: tenant.id,
            route: location.pathname
          });
      } catch (error) {
        console.error("Error logging route access:", error);
        // Silent failure, we don't want to disrupt the user experience
      }
    };
    
    // Small timeout to prevent excessive logging during redirects
    const timeoutId = setTimeout(logRouteAccess, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname, user?.id, tenant?.id]);

  // Tenant data protection
  useEffect(() => {
    // If no user or tenant is selected, no validation needed
    if (!user?.id || !tenant?.id) return;

    const validateTenantAccess = async () => {
      try {
        // Check if user has access to this tenant
        const { data, error } = await supabase.rpc("check_tenant_access", {
          requested_tenant_id: tenant.id
        });

        if (error) {
          console.error("Error validating tenant access:", error);
          return;
        }

        // If user doesn't have access to the tenant, log it
        if (!data) {
          console.error(`User ${user.id} attempted unauthorized access to tenant ${tenant.id}`);
          
          // Log security incident
          await supabase
            .from('system_logs')
            .insert({
              user_id: user.id,
              tenant_id: tenant.id,
              event_type: 'SECURITY_UNAUTHORIZED_TENANT_ACCESS',
              message: `Unauthorized tenant access attempt`,
              meta: { attempted_tenant_id: tenant.id }
            });
        }
      } catch (error) {
        console.error("Error validating tenant access:", error);
      }
    };

    validateTenantAccess();
  }, [user?.id, tenant?.id]);

  return <>{children}</>;
}
