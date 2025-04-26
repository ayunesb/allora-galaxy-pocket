
import React from 'react';
import { useContext } from 'react';
import { AuthContext, AuthContextType } from '@/contexts/AuthContext';
import { useAuthState } from './auth/useAuthState';
import { useAuthOperations } from './auth/useAuthOperations';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { 
    user, 
    session, 
    isLoading,
    setUser,
    setSession 
  } = useAuthState();

  const {
    error,
    signIn,
    signUp,
    signOut,
    refreshSession
  } = useAuthOperations();

  const contextValue: AuthContextType = {
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
