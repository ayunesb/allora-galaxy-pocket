
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; data: any | null; }>;
  signUp: (email: string, password: string, metadata?: object) => Promise<{ error: AuthError | null; data: any | null; }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to recover session on initial load
    const getInitialSession = async () => {
      setIsLoading(true);
      
      try {
        // Get existing session first
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error retrieving session:", error.message);
        }
        
        if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
          console.info("Initial session loaded successfully");
        } else {
          console.info("No active session found");
        }
      } catch (error) {
        console.error("Failed to get initial session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.info("Auth event:", event);
        
        // Update states synchronously
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Handle auth events with toast notifications
        if (event === 'SIGNED_OUT') {
          toast.info("You have been logged out");
        } else if (event === 'SIGNED_IN') {
          toast.success("Logged in successfully");
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
        
        setIsLoading(false);
      }
    );

    // Get initial session
    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await supabase.auth.signInWithPassword({ email, password });
      return response;
    } catch (error) {
      console.error("Sign in error:", error);
      return { data: null, error: { message: "An unexpected error occurred", name: "AuthError" } as AuthError };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata: object = {}) => {
    setIsLoading(true);
    try {
      const response = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: metadata
        }
      });
      
      return response;
    } catch (error) {
      console.error("Sign up error:", error);
      return { data: null, error: { message: "An unexpected error occurred", name: "AuthError" } as AuthError };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }
      
      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
        console.log("Session refreshed successfully");
      }
    } catch (error) {
      console.error("Failed to refresh session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
