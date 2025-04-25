
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSessionRefresh() {
  useEffect(() => {
    // Set up auto refreshing of tokens before they expire
    const refreshInterval = setInterval(async () => {
      try {
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.warn('Session refresh failed:', error);
        }
      } catch (error) {
        console.error('Error in session refresh interval:', error);
      }
    }, 4 * 60 * 60 * 1000); // Refresh every 4 hours

    return () => clearInterval(refreshInterval);
  }, []);
}
