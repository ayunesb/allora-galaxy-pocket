
// Deprecated: useUserRole instead for canonical role!
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useRole() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchRole() {
      try {
        // Use the new get_user_role()
        const { data, error } = await supabase.rpc("get_user_role");
        if (active) {
          if (error) {
            setRole(null);
            console.error('Error fetching role:', error);
          } else {
            setRole(data);
          }
        }
      } catch (error) {
        console.error('Error fetching role:', error);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchRole();
    return () => { active = false; };
  }, []);

  return { role, isLoading };
}
