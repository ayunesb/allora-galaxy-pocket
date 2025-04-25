
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to validate tenant access for the current user
 * Checks if the user has access to the selected tenant
 * Redirects to workspace selection if not
 */
export function useTenantValidation() {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const validateTenant = async () => {
      if (!user || !tenant) {
        setIsValidating(false);
        return;
      }

      try {
        setIsValidating(true);
        
        // Check if the user has access to this tenant
        const { data, error } = await supabase
          .from('tenant_user_roles')
          .select('role')
          .eq('tenant_id', tenant.id)
          .eq('user_id', user.id)
          .single();
        
        if (error || !data) {
          console.error("Tenant validation error:", error?.message || "No access to tenant");
          
          toast({
            title: "Access denied",
            description: "You don't have access to this workspace",
            variant: "destructive"
          });
          
          // Redirect to workspace selection
          navigate('/workspace');
          setIsValid(false);
        } else {
          setIsValid(true);
        }
      } catch (error: any) {
        console.error("Error validating tenant access:", error);
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateTenant();
  }, [user, tenant, toast, navigate]);

  return { isValidating, isValid };
}
