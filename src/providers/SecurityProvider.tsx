import React, { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { useSystemLogs } from "@/hooks/useSystemLogs";

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
  const { tenant, setTenant } = useTenant();
  const navigate = useNavigate();
  const { logActivity, logSecurityEvent } = useSystemLogs();
  
  // Log route access for audit purposes
  useEffect(() => {
    // Skip logging for public routes
    if (location.pathname.startsWith('/auth/') || location.pathname === '/' || !user?.id || !tenant?.id) return;
    
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
    // Skip for auth pages and workspace selection
    if (!user?.id || !tenant?.id || 
        location.pathname.startsWith('/auth/') || 
        location.pathname === '/workspace') return;

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

        // If user doesn't have access to the tenant
        if (!data) {
          console.error(`User ${user.id} attempted unauthorized access to tenant ${tenant.id}`);
          
          // Log security incident
          await logSecurityEvent(
            `Unauthorized tenant access attempt`,
            'UNAUTHORIZED_TENANT_ACCESS', 
            { 
              attempted_tenant_id: tenant.id,
              path: location.pathname
            }
          );

          // Reset tenant selection
          setTenant(null);
          localStorage.removeItem('tenant_id');
          
          // Notify user
          toast.error("Access denied", {
            description: "You don't have access to this workspace",
          });

          // Redirect to workspace switcher
          navigate("/workspace", { replace: true });
        } else {
          // Successfully validated tenant access
          await logActivity({
            event_type: 'TENANT_ACCESS_VALIDATED',
            message: `User accessed tenant ${tenant.name}`,
            meta: {
              tenant_id: tenant.id,
              path: location.pathname,
              phase: 'verification'
            }
          });
        }
      } catch (error) {
        console.error("Error validating tenant access:", error);
      }
    };

    validateTenantAccess();
  }, [user?.id, tenant?.id, location.pathname, navigate, setTenant, logSecurityEvent, logActivity]);

  return <>{children}</>;
}
