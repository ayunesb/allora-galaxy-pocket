
import { createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useAuthState } from "./auth/useAuthState";
import { useAuthActions } from "./auth/useAuthActions";
import { useAuthSetup } from "./auth/useAuthSetup";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshSession: () => Promise<boolean>;
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

  const {
    login,
    signup,
    logout,
    refreshSession
  } = useAuthActions(setIsLoading, setAuthError);

  // Set up auth state change listener and session check
  useAuthSetup(setSession, setUser, setIsLoading);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      login, 
      signup, 
      logout, 
      isLoading,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
