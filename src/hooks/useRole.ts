
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { UserRole } from '@/types/invite';

export function useRole() {
  const [role, setRole] = useState<UserRole>('viewer');
  const [isLoading, setIsLoading] = useState(true);
  const { tenant } = useTenant();

  useEffect(() => {
    async function fetchRole() {
      try {
        if (!tenant?.id) return;

        // Get the current user ID properly by awaiting the getUser() Promise
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) return;

        const { data, error } = await supabase
          .from('tenant_user_roles')
          .select('role')
          .eq('tenant_id', tenant.id)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data) setRole(data.role);
      } catch (error) {
        console.error('Error fetching role:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRole();
  }, [tenant?.id]);

  return { role, isLoading };
}
