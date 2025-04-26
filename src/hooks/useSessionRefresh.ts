import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";

export function useSessionRefresh() {
  const { session, refreshSession } = useAuth();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const setupRefreshTimer = () => {
      // Clear any existing timer
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      if (!session) return;

      // Calculate when the token expires (5 minutes before actual expiry)
      const expiresAt = session.expires_at; // seconds since epoch
      if (!expiresAt) return;
      
      const expiresAtDate = new Date(expiresAt * 1000);
      const now = new Date();
      
      // Calculate time until expiry with 5-minute buffer
      let timeUntilExpiry = expiresAtDate.getTime() - now.getTime() - 5 * 60 * 1000;
      
      // If token is already expired or expiring in less than 30 seconds, refresh now
      if (timeUntilExpiry < 30 * 1000) {
        console.log("Token expiring soon, refreshing now");
        refreshSession();
        return;
      }

      console.log(`Setting up token refresh in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes`);
      
      // Otherwise set timer to refresh before expiry
      refreshTimerRef.current = setTimeout(() => {
        console.log("Refreshing auth token via timer");
        refreshSession();
      }, timeUntilExpiry);
    };

    setupRefreshTimer();

    // Cleanup function
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [session, refreshSession]);

  return null;
}
