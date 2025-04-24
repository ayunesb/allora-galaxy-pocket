
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export function useSessionRefresh() {
  const { session, refreshSession } = useAuth();
  const lastRefreshAttemptRef = useRef<number>(0);
  const refreshIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const clearRefreshInterval = () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };

    const tokenRefreshCheck = async () => {
      if (!session) return;
      
      const now = Date.now();
      const expiresAt = (session.expires_at || 0) * 1000;
      const timeRemaining = expiresAt - now;
      
      // Refresh when less than 30 minutes remaining but more than 0
      const thirtyMinutes = 30 * 60 * 1000;
      
      // Avoid frequent refresh attempts (no more than once per minute)
      if (now - lastRefreshAttemptRef.current < 60000) return;

      if (timeRemaining < thirtyMinutes && timeRemaining > 0) {
        console.log("Session expiring soon, refreshing token...");
        lastRefreshAttemptRef.current = now;
        
        try {
          await refreshSession();
        } catch (error) {
          console.error("Failed to refresh session:", error);
          
          // If refresh fails and session is very close to expiring (5 min), warn user
          if (timeRemaining < 5 * 60 * 1000) {
            toast.warning("Your session will expire soon", {
              description: "You may need to log in again to continue",
              duration: 10000,
            });
          }
        }
      } else if (timeRemaining <= 0) {
        // Session expired
        toast.error("Your session has expired", {
          description: "Please log in again to continue",
        });
        
        // Sign out the user to clear the expired session
        await supabase.auth.signOut();
        
        // Stop checking for refresh
        clearRefreshInterval();
      }
    };
    
    // Check immediately on mount
    tokenRefreshCheck();
    
    // Then check every 5 minutes
    refreshIntervalRef.current = window.setInterval(tokenRefreshCheck, 5 * 60 * 1000);
    
    return () => {
      clearRefreshInterval();
    };
  }, [session, refreshSession]);

  return null;
}
