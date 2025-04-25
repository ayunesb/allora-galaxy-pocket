
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ToastService } from '@/services/ToastService';

interface AuthSessionManagerOptions {
  rememberMe?: boolean;
  refreshInterval?: number; // in minutes
  expiryWarningTime?: number; // in minutes
}

/**
 * Hook for managing authentication sessions including:
 * - Session expiry handling
 * - Token refresh
 * - Remember me functionality
 */
export function useAuthSessionManager(options: AuthSessionManagerOptions = {}) {
  const {
    rememberMe = true,
    refreshInterval = 30, // refresh token every 30 minutes by default
    expiryWarningTime = 5 // warn user 5 minutes before session expires
  } = options;
  
  const [session, setSession] = useState<Session | null>(null);
  const [expiryWarningShown, setExpiryWarningShown] = useState(false);
  
  // Handle session refresh
  useEffect(() => {
    if (!session) return;
    
    // Set up token refresh interval
    const refreshTimer = setInterval(async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error("Error refreshing session:", error);
          return;
        }
        
        if (data.session) {
          setSession(data.session);
          console.log("Session refreshed successfully");
        }
      } catch (err) {
        console.error("Session refresh failed:", err);
      }
    }, refreshInterval * 60 * 1000);
    
    // Clean up timer on unmount or session change
    return () => clearInterval(refreshTimer);
  }, [session, refreshInterval]);
  
  // Handle session expiry warning
  useEffect(() => {
    if (!session) return;
    
    // Check for session expiration
    const checkExpiryTimer = setInterval(() => {
      if (!session?.expires_at) return;
      
      const expiresAtMs = session.expires_at * 1000;
      const nowMs = new Date().getTime();
      const timeRemainingMinutes = (expiresAtMs - nowMs) / (60 * 1000);
      
      // If session is about to expire and warning not shown yet
      if (timeRemainingMinutes <= expiryWarningTime && !expiryWarningShown) {
        ToastService.warning({
          title: "Session expiring soon",
          description: `Your session will expire in ${Math.ceil(timeRemainingMinutes)} minutes.`,
          duration: 10000
        });
        setExpiryWarningShown(true);
      }
      
      // Reset warning flag if session was refreshed
      if (timeRemainingMinutes > expiryWarningTime && expiryWarningShown) {
        setExpiryWarningShown(false);
      }
    }, 60 * 1000); // Check every minute
    
    return () => clearInterval(checkExpiryTimer);
  }, [session, expiryWarningTime, expiryWarningShown]);
  
  // Set up auth state listener
  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth event:", event, Boolean(currentSession));
      setSession(currentSession);
      
      if (event === 'SIGNED_OUT') {
        // Clear any persistent storage if not using remember me
        if (!rememberMe) {
          localStorage.removeItem('supabase.auth.token');
        }
      }
    });
    
    // Initial session check
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession) {
        const expiresAt = new Date((currentSession.expires_at || 0) * 1000);
        const timeUntilExpiry = expiresAt.getTime() - new Date().getTime();
        console.log(`Session expires in ${Math.floor(timeUntilExpiry / 60000)} minutes (${expiresAt.toLocaleString()})`);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [rememberMe]);
  
  /**
   * Sign in with remember me option
   */
  const signInWithRememberMe = async (email: string, password: string, remember: boolean = false) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          persistSession: remember
        }
      });
      
      // Handle remember me setting separately after successful login
      if (!error && remember) {
        // Set a longer expiration for localStorage
        localStorage.setItem('supabase.auth.remember', 'true');
      } else if (!error && !remember) {
        // Ensure the token isn't stored long-term
        localStorage.setItem('supabase.auth.remember', 'false');
      }
      
      if (error) throw error;
      return { success: true, session: data.session };
    } catch (error: any) {
      console.error("Sign in error:", error);
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Force refresh the current session
   */
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      setSession(data.session);
      return { success: true };
    } catch (error: any) {
      console.error("Session refresh error:", error);
      return { success: false, error: error.message };
    }
  };
  
  return {
    session,
    signInWithRememberMe,
    refreshSession,
    isExpiringSoon: expiryWarningShown
  };
}
