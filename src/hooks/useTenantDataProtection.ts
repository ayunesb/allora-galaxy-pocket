
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

/**
 * This hook ensures proper tenant data isolation by validating that the current
 * user has access to the selected tenant. It protects against unauthorized
 * cross-tenant data access.
 */
export function useTenantDataProtection() {
  const { user } = useAuth();
  const { tenant, setTenant } = useTenant();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // If no user or tenant is selected, no validation needed
    if (!user?.id || !tenant?.id) return;

    const validateTenantAccess = async () => {
      try {
        // Check if user has access to this tenant
        const { data, error } = await supabase.rpc("check_tenant_access", {
          requested_tenant_id: tenant.id
        });

        if (error) throw error;

        // If user doesn't have access to the tenant
        if (!data) {
          console.error(`User ${user.id} attempted unauthorized access to tenant ${tenant.id}`);
          
          // Log security incident
          await supabase
            .from('system_logs')
            .insert({
              user_id: user.id,
              tenant_id: tenant.id, // Still log the attempted tenant
              event_type: 'SECURITY_UNAUTHORIZED_TENANT_ACCESS',
              message: `Unauthorized tenant access attempt`,
              meta: { attempted_tenant_id: tenant.id }
            });

          // Reset tenant selection
          setTenant(null);
          
          // Notify user
          toast({
            title: "Access denied",
            description: "You don't have access to this workspace",
            variant: "destructive"
          });

          // Redirect to workspace switcher
          navigate("/workspace");
        }
      } catch (error) {
        console.error("Error validating tenant access:", error);
      }
    };

    validateTenantAccess();
  }, [user?.id, tenant?.id]);

  return null; // No UI component
}
