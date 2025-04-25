
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSessionRefresh = () => {
  useEffect(() => {
    // Get current timestamp
    const now = new Date();
    
    // Schedule token refresh every 45 minutes
    const refreshInterval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Check if session is about to expire (within 15 minutes)
          const expiresAt = new Date(session.expires_at * 1000);
          const minutesUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / 1000 / 60);
          
          if (minutesUntilExpiry < 15) {
            console.log('Session about to expire, refreshing token...');
            await supabase.auth.refreshSession();
            console.log('Token refresh completed');
          }
        }
      } catch (error) {
        console.error('Error during session refresh:', error);
      }
    }, 45 * 60 * 1000); // 45 minutes
    
    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);
};
