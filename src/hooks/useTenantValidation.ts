
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { useAuth } from './useAuth';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';

export function useTenantValidation() {
  const { tenant, setTenant } = useTenant();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id || !tenant?.id) return;

    const validateTenantAccess = async () => {
      try {
        const { data: hasAccess, error } = await supabase.rpc(
          'check_tenant_access',
          { requested_tenant_id: tenant.id }
        );

        if (error) throw error;

        if (!hasAccess) {
          // Log security incident
          await supabase.from('system_logs').insert({
            user_id: user.id,
            tenant_id: tenant.id,
            event_type: 'SECURITY_UNAUTHORIZED_TENANT_ACCESS',
            message: 'Unauthorized tenant access attempt',
            meta: { attempted_tenant_id: tenant.id }
          });

          // Reset tenant selection and redirect
          setTenant(null);
          localStorage.removeItem('tenant_id');
          
          toast.error('Access to workspace denied');
          navigate('/workspace');
        }
      } catch (err: any) {
        console.error('Tenant validation error:', err);
        toast.error('Error validating workspace access');
      }
    };

    validateTenantAccess();
  }, [user?.id, tenant?.id, setTenant, navigate]);

  return null;
}
