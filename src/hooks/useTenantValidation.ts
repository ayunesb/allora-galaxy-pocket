
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to validate tenant access for the current user
 * Uses security definer functions to avoid RLS recursion
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
        
        // Use security definer function to avoid recursion
        const { data, error } = await supabase.rpc(
          "check_tenant_user_access_safe",
          { tenant_uuid: tenant.id, user_uuid: user.id }
        );
        
        if (error) {
          console.error("Tenant validation error:", error.message);
          
          toast({
            title: "Error validating tenant access",
            description: error.message || "Couldn't verify tenant access",
            variant: "destructive"
          });
          
          setIsValid(false);
        } else if (!data) {
          console.error("No access to tenant:", tenant.id);
          
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
        
        toast({
          title: "Validation error",
          description: error.message || "An error occurred while validating access",
          variant: "destructive"
        });
      } finally {
        setIsValidating(false);
      }
    };

    validateTenant();
  }, [user, tenant, toast, navigate]);

  return { isValidating, isValid };
}
