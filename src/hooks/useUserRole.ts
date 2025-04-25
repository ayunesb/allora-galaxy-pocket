
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useTenant } from "./useTenant";

export function useUserRole() {
  const { user } = useAuth();
  const { tenant } = useTenant();

  const { data: role = "viewer", isLoading } = useQuery({
    queryKey: ["user-role", user?.id, tenant?.id],
    queryFn: async () => {
      if (!user || !tenant) return "viewer";

      try {
        const { data, error } = await supabase
          .from("tenant_user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("tenant_id", tenant.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          return "viewer";
        }

        return data?.role || "viewer";
      } catch (error) {
        console.error("Exception in useUserRole:", error);
        return "viewer";
      }
    },
    enabled: !!user && !!tenant,
  });

  return {
    role,
    isLoading,
  };
}
