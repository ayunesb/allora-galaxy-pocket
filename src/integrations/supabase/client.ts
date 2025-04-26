
import { createClient } from '@supabase/supabase-js';

// Set default values for development environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lxsuqqlfuftnvuvtctsx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3VxcWxmdWZ0bnZ1dnRjdHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMzA5OTgsImV4cCI6MjA1OTcwNjk5OH0.umJfetR46M11PJZtIN9CCURPkp3JK6tn_17KMMjC3ks';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables. Using default values for this session."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
