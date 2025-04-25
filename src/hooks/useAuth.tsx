
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/auth/useAuthState';
import { useAuthSetup } from '@/hooks/auth/useAuthSetup';
import { useSessionRefresh } from '@/hooks/auth/useSessionRefresh';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    user,
    setUser,
    session,
    setSession,
    isLoading,
    setIsLoading,
    authError,
    setAuthError
  } = useAuthState();

  // Set up auth listeners and session checking
  useAuthSetup(setSession, setUser, setIsLoading);
  
  // Configure automatic token refresh
  useSessionRefresh();

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setAuthError(error.message);
      console.error('Sign in error:', error);
    }
    
    setIsLoading(false);
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      setAuthError(error.message);
      console.error('Sign up error:', error);
    }
    
    setIsLoading(false);
    return { error };
  };

  const signOut = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      setAuthError(error.message);
    }
    
    setIsLoading(false);
  };

  const refreshSession = async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
    } catch (error: any) {
      console.error('Failed to refresh session:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    error: authError,
    signIn,
    signUp,
    signOut,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
