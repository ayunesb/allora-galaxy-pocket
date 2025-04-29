
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

export const useSessionRefresh = () => {
  const refreshIntervalRef = useRef<number | null>(null);
  const expiryWarningRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any existing intervals
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    if (expiryWarningRef.current) {
      clearTimeout(expiryWarningRef.current);
    }
    
    const setupSessionRefresh = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('No active session to refresh');
          return;
        }
        
        // Convert to date object
        const expiresAt = new Date(session.expires_at * 1000);
        const now = new Date();
        
        // Calculate time until expiration in milliseconds
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        const timeToRefresh = timeUntilExpiry - (15 * 60 * 1000); // 15 minutes before expiry
        
        if (timeUntilExpiry <= 0) {
          console.log('Session has already expired');
          return;
        }
        
        // Set a warning for 30 minutes before expiration
        if (timeUntilExpiry > 30 * 60 * 1000) {
          expiryWarningRef.current = window.setTimeout(() => {
            toast.warning('Session expiring soon', {
              description: 'Your session will expire in 30 minutes. Save your work.'
            });
          }, timeUntilExpiry - (30 * 60 * 1000));
        }
        
        // If the session is about to expire in less than 15 minutes, refresh immediately
        if (timeToRefresh <= 0) {
          console.log('Session expiring soon, refreshing now');
          await supabase.auth.refreshSession();
          // Re-run setup after refresh
          setupSessionRefresh();
          return;
        }
        
        // Schedule refresh for 15 minutes before expiry
        console.log(`Scheduling token refresh in ${Math.round(timeToRefresh/1000/60)} minutes`);
        
        refreshIntervalRef.current = window.setTimeout(async () => {
          console.log('Refreshing auth token...');
          try {
            await supabase.auth.refreshSession();
            console.log('Token refresh completed');
            // Setup next refresh
            setupSessionRefresh();
          } catch (error) {
            console.error('Error refreshing token:', error);
            toast.error('Authentication error', {
              description: 'Failed to refresh your session. Try logging out and in again.'
            });
          }
        }, timeToRefresh);
      } catch (error) {
        console.error('Error during session setup:', error);
      }
    };
    
    // Run immediately
    setupSessionRefresh();
    
    // Also listen for auth state changes to reset the refresh timer
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setupSessionRefresh();
    });
    
    // Cleanup interval on component unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearTimeout(refreshIntervalRef.current);
      }
      if (expiryWarningRef.current) {
        clearTimeout(expiryWarningRef.current);
      }
      subscription.unsubscribe();
    };
  }, []);
};
