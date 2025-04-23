
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Returns the main role for the current user (client, developer, or admin).
 */
export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    async function fetchRole() {
      setIsLoading(true);
      if (!user?.id) {
        setRole(null);
        setIsLoading(false);
        return;
      }
      // Use the get_user_role() Postgres function
      const { data, error } = await supabase.rpc("get_user_role");
      if (active) {
        if (error) {
          console.error("Error fetching user role:", error.message);
          setRole(null);
        } else {
          setRole(data); // "admin", "developer", "client", or null
        }
        setIsLoading(false);
      }
    }
    fetchRole();

    return () => {
      active = false;
    };
  }, [user?.id]);

  return { role, isLoading };
}
