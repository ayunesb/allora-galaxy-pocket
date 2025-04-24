
import { Session } from "@supabase/supabase-js";
import { toast } from "@/components/ui/sonner";

export function useAuthEvents(
  setSession: (session: Session | null) => void,
  setUser: (user: any) => void,
  setIsLoading: (loading: boolean) => void
) {
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

  return { handleAuthStateChange };
}
