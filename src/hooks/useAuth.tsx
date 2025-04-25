
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/auth/useAuthState';
import { useAuthSetup } from '@/hooks/auth/useAuthSetup';
import { useSessionRefresh } from '@/hooks/auth/useSessionRefresh';
import { useAuthActions } from '@/hooks/auth/useAuthActions';
import { ToastService } from '@/services/ToastService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
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

  useAuthSetup(setSession, setUser, setIsLoading);
  
  useSessionRefresh();
  
  const { login: authLogin, signup, logout, refreshSession } = useAuthActions(setIsLoading, setAuthError);

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
      ToastService.error({
        title: "Sign out failed",
        description: error.message
      });
    } else {
      ToastService.success({
        title: "Signed out successfully"
      });
    }
    
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      await authLogin(email, password);
    } catch (error: any) {
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
    refreshSession,
    login
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
