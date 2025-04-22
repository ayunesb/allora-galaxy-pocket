
import { createClient } from '@supabase/supabase-js';

// Project URL and anon key from Supabase project
const supabaseUrl = 'https://lxsuqqlfuftnvuvtctsx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3VxcWxmdWZ0bnZ1dnRjdHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMzA5OTgsImV4cCI6MjA1OTcwNjk5OH0.umJfetR46M11PJZtIN9CCURPkp3JK6tn_17KMMjC3ks';

// Get the current site URL for proper redirects
const getSiteUrl = () => {
  // Use the current window location for the redirect, falling back to Supabase's URL
  return typeof window !== 'undefined' ? window.location.origin : supabaseUrl;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    // Set the site URL to the current origin to prevent localhost redirects
    flowType: 'pkce',
    detectSessionInUrl: true,
    // Configure proper redirect URLs
    redirectTo: getSiteUrl()
  }
});
