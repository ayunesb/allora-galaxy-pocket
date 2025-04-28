
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";

export function useUserRole() {
  const { tenant } = useTenant();

  const { data: role = 'viewer', isLoading } = useQuery({
    queryKey: ['user-role', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return 'viewer';
      
      const { data, error } = await supabase
        .rpc('get_user_tenant_role', { 
          p_tenant_id: tenant.id,
          p_user_id: (await supabase.auth.getUser()).data.user?.id
        });
      
      if (error) throw error;
      return data || 'viewer';
    },
    enabled: !!tenant?.id
  });

  return { role, isLoading };
}
