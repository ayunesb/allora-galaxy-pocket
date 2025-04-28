
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";
import { useAuth } from "./useAuth";

export function useUserRole() {
  const { tenant } = useTenant();
  const { user } = useAuth();

  const { data: role = 'viewer', isLoading } = useQuery({
    queryKey: ['user-role', tenant?.id, user?.id],
    queryFn: async () => {
      if (!tenant?.id || !user?.id) return 'viewer';
      
      try {
        const { data, error } = await supabase
          .rpc('get_user_role_for_tenant', { 
            tenant_uuid: tenant.id,
            user_uuid: user.id
          });
        
        if (error) {
          console.error('Error getting user role:', error);
          throw error;
        }
        
        return data || 'viewer';
      } catch (error) {
        console.error('Error in useUserRole:', error);
        return 'viewer';
      }
    },
    enabled: !!tenant?.id && !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1
  });

  return { role, isLoading };
}
