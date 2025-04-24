
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lxsuqqlfuftnvuvtctsx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3VxcWxmdWZ0bnZ1dnRjdHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMzA5OTgsImV4cCI6MjA1OTcwNjk5OH0.umJfetR46M11PJZtIN9CCURPkp3JK6tn_17KMMjC3ks';

// Initialize headers with tenant ID if available
const initialHeaders = {
  'x-tenant-id': localStorage.getItem('tenant_id') || ''
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit' // Use implicit flow for browser environments
  },
  global: {
    headers: initialHeaders
  }
});

// Update headers whenever tenant ID changes
export const updateTenantHeader = (tenantId: string | null) => {
  // Create a new headers object
  const newHeaders = {
    'x-tenant-id': tenantId || ''
  };
  
  // Use the global.headers setter to update the headers
  supabase.auth.setSession({
    access_token: '',
    refresh_token: ''
  }).then(({ data }) => {
    // This is a workaround to refresh the client with the new headers
    if (data.session) {
      // If there's a session, it will be maintained
      console.log('Headers updated with tenant ID:', tenantId);
    }
  });

  // Set the headers globally for all future requests
  supabase.rest.headers = newHeaders;
};

// Monitor auth status
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`Auth event: ${event}`, session ? 'Session exists' : 'No session');
  
  // Log expiry if session exists to help with debugging
  if (session?.expires_at) {
    const expiryDate = new Date(session.expires_at * 1000);
    const now = new Date();
    const minutesRemaining = Math.floor((expiryDate.getTime() - now.getTime()) / 1000 / 60);
    console.log(`Session expires in ${minutesRemaining} minutes (${expiryDate.toISOString()})`);
  }
});

// Export a function to verify auth state
export const verifyAuth = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    return { isAuthenticated: !!data.user, user: data.user, error };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return { isAuthenticated: false, user: null, error };
  }
};
