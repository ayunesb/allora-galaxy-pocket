
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';

// Get or create a session ID that persists during the demo visit
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('demo_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem('demo_session_id', sessionId);
  }
  return sessionId;
};

export const useDemoAnalytics = () => {
  const { tenant } = useTenant();
  const sessionId = getSessionId();

  const trackDemoEvent = async (eventType: string, details: Record<string, any> = {}) => {
    try {
      await supabase.from('demo_analytics').insert({
        session_id: sessionId,
        event_type: eventType,
        page_path: window.location.pathname,
        interaction_details: details,
        tenant_id: tenant?.id
      });
    } catch (error) {
      console.error('Failed to track demo event:', error);
    }
  };

  // Track page views automatically
  useEffect(() => {
    if (window.location.pathname.startsWith('/demo')) {
      trackDemoEvent('page_view');
    }
  }, [window.location.pathname]);

  return { trackDemoEvent };
};
