
import { User, Session } from "@supabase/supabase-js";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export function useAuthSetup(
  setSession: (session: Session | null) => void,
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void
) {
  useEffect(() => {
    const setUpAuthStateChange = async () => {
      // Handle auth state changes
      const handleAuthStateChange = (event: string, currentSession: Session | null) => {
        // Synchronously update state first
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        // Handle auth events
        if (event === 'SIGNED_OUT') {
          toast.success("Logged out successfully");
        } else if (event === 'SIGNED_IN') {
          toast.success("Logged in successfully");
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Session token refreshed successfully');
        } else if (event === 'USER_UPDATED') {
          console.log('User profile updated');
        }
      };

      // Set up the auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

      // Check for existing session
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
