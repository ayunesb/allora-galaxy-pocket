
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
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
  const [error, setError] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        // First reset error state on any auth change
        setError(null);
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          setSession(null);
          setUser(null);
        }
        
        // Handle auth events with toast notifications
        if (event === 'SIGNED_OUT') {
          toast.info("You have been logged out");
        } else if (event === 'SIGNED_IN') {
          toast.success("Logged in successfully");
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        } else if (event === 'USER_UPDATED') {
          toast.info("User profile updated");
        }
        
        // Ensure loading state is cleared regardless of event
        setIsLoading(false);
        setAuthInitialized(true);
      }
    );

    // Try to recover session on initial load, but only after subscription is set up
    const getInitialSession = async () => {
      try {
        // Get existing session first
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error retrieving session:", sessionError.message);
          setError(sessionError.message);
        }
        
        if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
          console.info("Initial session loaded successfully");
        } else {
          console.info("No active session found");
        }
      } catch (error: any) {
        console.error("Failed to get initial session:", error);
        setError(error.message || "Failed to initialize authentication");
      } finally {
        setIsLoading(false);
        setAuthInitialized(true);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await supabase.auth.signInWithPassword({ email, password });
      
      if (response.error) {
        setError(response.error.message);
        toast.error("Login failed", { 
          description: response.error.message 
        });
      }
      
      return response;
    } catch (error: any) {
      console.error("Sign in error:", error);
      setError(error.message || "An unexpected error occurred during login");
      toast.error("Login failed", { 
        description: error.message || "Please check your credentials and try again" 
      });
      
      return { 
        data: null, 
        error: { 
          message: error.message || "An unexpected error occurred", 
          name: "AuthError" 
        } as AuthError 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata: object = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: metadata
        }
      });
      
      if (response.error) {
        setError(response.error.message);
        toast.error("Sign up failed", { 
          description: response.error.message 
        });
      } else if (response.data?.user) {
        toast.success("Account created successfully", {
          description: "Please check your email for verification"
        });
      }
      
      return response;
    } catch (error: any) {
      console.error("Sign up error:", error);
      setError(error.message || "An unexpected error occurred during sign up");
      toast.error("Sign up failed", { 
        description: error.message || "Please try again" 
      });
      
      return { 
        data: null, 
        error: { 
          message: error.message || "An unexpected error occurred", 
          name: "AuthError" 
        } as AuthError 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error("Sign out error:", error);
      setError(error.message || "An unexpected error occurred during sign out");
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        setError(refreshError.message);
        throw refreshError;
      }
      
      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
        console.log("Session refreshed successfully");
      } else {
        console.log("No session to refresh");
      }
    } catch (error: any) {
      console.error("Failed to refresh session:", error);
      setError(error.message || "Failed to refresh authentication session");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = {
    user,
    session,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    refreshSession
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
