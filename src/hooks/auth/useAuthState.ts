
import { useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  return {
    user,
    setUser,
    session,
    setSession,
    isLoading,
    setIsLoading,
    authError,
    setAuthError
  };
}
