
import React, { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";
import { useSystemLogs } from "@/hooks/useSystemLogs";

interface SecurityProviderProps {
  children: ReactNode;
}

/**
 * SecurityProvider ensures that security features are enabled app-wide
 * It uses security definer functions to prevent RLS recursion
 */
export function SecurityProvider({ children }: SecurityProviderProps) {
  // Using a try-catch to handle the case when the component is rendered outside Router context
  let location;
  let navigate;
  
  try {
    location = useLocation();
    navigate = useNavigate();
  } catch (error) {
    console.warn("SecurityProvider rendered outside Router context. Some security features will be disabled.");
    // Return children immediately if not in Router context
    return <>{children}</>;
  }
  
  const { user } = useAuth();
  const { tenant, setTenant } = useTenant();
  const { logActivity, logSecurityEvent } = useSystemLogs();
  
  // Log route access for audit purposes
  useEffect(() => {
    // Skip logging for public routes
    if (!location || !user?.id || !tenant?.id || 
        location.pathname.startsWith('/auth/') || 
        location.pathname === '/') return;
    
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
  }, [location?.pathname, user?.id, tenant?.id]);

  // Tenant data protection
  useEffect(() => {
    // If no user or tenant is selected, no validation needed
    // Skip for auth pages and workspace selection
    if (!user?.id || !tenant?.id || 
        !location ||
        location.pathname.startsWith('/auth/') || 
        location.pathname === '/workspace') return;

    const validateTenantAccess = async () => {
      try {
        // Use the security definer function to avoid recursion
        const { data, error } = await supabase.rpc("check_tenant_user_access_safe", {
          tenant_uuid: tenant.id,
          user_uuid: user.id
        });

        if (error) {
          console.error("Error validating tenant access:", error);
          // Log security error but don't fail silently
          await logSecurityEvent(
            `Tenant access validation error: ${error.message}`,
            'TENANT_ACCESS_VALIDATION_ERROR',
            { error: error.message, path: location.pathname }
          );
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
          if (navigate) {
            navigate("/workspace", { replace: true });
          }
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
        
        // Log the error but don't disrupt user experience
        await logSecurityEvent(
          `Tenant access validation exception: ${(error as Error).message || 'Unknown error'}`,
          'TENANT_VALIDATION_EXCEPTION',
          { path: location.pathname }
        );
      }
    };

    validateTenantAccess();
  }, [user?.id, tenant?.id, location?.pathname, navigate, setTenant, logSecurityEvent, logActivity]);

  return <>{children}</>;
}
