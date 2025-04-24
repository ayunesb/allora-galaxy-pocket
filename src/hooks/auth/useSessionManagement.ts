
import { supabase } from "@/integrations/supabase/client";

export function useSessionManagement() {
  const checkExistingSession = async (
    setSession: (session: any) => void,
    setUser: (user: any) => void,
    setIsLoading: (loading: boolean) => void
  ) => {
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
      } else {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { checkExistingSession };
}
