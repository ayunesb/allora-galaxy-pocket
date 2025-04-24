
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

export function useSessionRefresh() {
  const { session, refreshSession } = useAuth();
  const lastRefreshAttemptRef = useRef<number>(0);

  useEffect(() => {
    const tokenRefreshCheck = async () => {
      if (!session) return;
      
      const now = new Date().getTime();
      const expiresAt = (session.expires_at || 0) * 1000;
      const timeRemaining = expiresAt - now;
      const thirtyMinutes = 30 * 60 * 1000;
      
      // Avoid frequent refresh attempts
      if (now - lastRefreshAttemptRef.current < 60000) return;

      if (timeRemaining < thirtyMinutes && timeRemaining > 0) {
        console.log("Session expiring soon, refreshing token...");
        lastRefreshAttemptRef.current = now;
        await refreshSession();
      }
    };
    
    tokenRefreshCheck();
    // Run check every 5 minutes
    const interval = setInterval(tokenRefreshCheck, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [session, refreshSession]);
}
