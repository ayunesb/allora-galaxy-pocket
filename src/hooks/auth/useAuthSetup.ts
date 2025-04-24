
import { User, Session } from "@supabase/supabase-js";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthEvents } from "./useAuthEvents";
import { useSessionManagement } from "./useSessionManagement";

export function useAuthSetup(
  setSession: (session: Session | null) => void,
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void
) {
  const { handleAuthStateChange } = useAuthEvents(setSession, setUser, setIsLoading);
  const { checkExistingSession } = useSessionManagement();

  useEffect(() => {
    const setUpAuthStateChange = async () => {
      // Set up the auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

      // Check for existing session
      await checkExistingSession(setSession, setUser, setIsLoading);
      
      return () => {
        subscription.unsubscribe();
      };
    };

    // Initialize auth
    const cleanup = setUpAuthStateChange();
    
    return () => {
      // Cleanup auth state change subscription
      cleanup.then(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [setSession, setUser, setIsLoading]);
}
