
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

export function useSessionRefresh(refreshInterval = 3600000) { // Default: 1 hour
  const { session, refreshSession } = useAuth();
  const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now());

  useEffect(() => {
    // Don't set up refresh if there's no session
    if (!session) return;
    
    // Calculate time until expiry (with 5-minute buffer)
    const sessionExpiryTime = new Date(session.expires_at || 0).getTime();
    const timeUntilExpiry = sessionExpiryTime - Date.now() - 300000; // 5 min buffer
    
    // Determine when to refresh - either at our interval or before expiry
    const timeToRefresh = Math.min(
      refreshInterval,
      timeUntilExpiry > 0 ? timeUntilExpiry : refreshInterval / 2
    );

    // Set up the refresh interval
    const intervalId = setInterval(() => {
      refreshSession().then(() => {
        setLastRefreshed(Date.now());
      });
    }, timeToRefresh);

    return () => clearInterval(intervalId);
  }, [session, refreshSession, refreshInterval, lastRefreshed]);

  return { lastRefreshed };
}
