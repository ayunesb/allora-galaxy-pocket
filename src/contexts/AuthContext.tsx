
import { createContext } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; data: any | null; }>;
  signUp: (email: string, password: string, metadata?: object) => Promise<{ error: AuthError | null; data: any | null; }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
