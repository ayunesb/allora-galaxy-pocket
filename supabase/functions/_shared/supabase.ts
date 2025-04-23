
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// For Edge Functions, always use Supabase project ref/anon directly!
const supabaseUrl = "https://lxsuqqlfuftnvuvtctsx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3VxcWxmdWZ0bnZ1dnRjdHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMzA5OTgsImV4cCI6MjA1OTcwNjk5OH0.umJfetR46M11PJZtIN9CCURPkp3JK6tn_17KMMjC3ks";

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
