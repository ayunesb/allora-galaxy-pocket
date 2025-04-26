
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          setSession(null);
          setUser(null);
        }
        
        // Handle auth events with toast notifications
        if (event === 'SIGNED_OUT') {
          toast.info("You have been logged out");
        } else if (event === 'SIGNED_IN') {
          toast.success("Logged in successfully");
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        } else if (event === 'USER_UPDATED') {
          toast.info("User profile updated");
        }
        
        setIsLoading(false);
        setAuthInitialized(true);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Error retrieving session:", error.message);
      }
      
      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
      
      setIsLoading(false);
      setAuthInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    isLoading,
    authInitialized,
    setUser,
    setSession
  };
}
