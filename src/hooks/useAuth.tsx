
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Handle auth state changes
    const handleAuthStateChange = (event: string, currentSession: Session | null) => {
      // Synchronously update state first
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);

      // Handle auth events
      if (event === 'SIGNED_OUT') {
        toast.success("Logged out successfully");
      } else if (event === 'SIGNED_IN') {
        toast.success("Logged in successfully");
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Session token refreshed successfully');
      } else if (event === 'USER_UPDATED') {
        console.log('User profile updated');
      }
    };

    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error fetching session:", error);
          setAuthError(error.message);
        } else {
          // Only update if the component is still mounted
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize auth
    initializeAuth();
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Manually refresh session - useful for recovering from auth errors
  const refreshSession = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Session refresh error:", error);
        toast.error("Failed to refresh authentication");
        return false;
      }
      
      setSession(data.session);
      setUser(data.session?.user ?? null);
      return true;
    } catch (error) {
      console.error("Session refresh exception:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        let errorMessage = error.message;
        
        // Enhanced error messaging
        if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please check your email to confirm your account before logging in";
        } else if (error.message.includes("Invalid login")) {
          errorMessage = "Invalid email or password";
        }
        
        toast.error("Login failed", {
          description: errorMessage
        });
        throw error;
      }

      // No need to set user/session here as the onAuthStateChange will handle it
    } catch (error) {
      const e = error as Error;
      console.error("Login error:", e);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Check if email already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', email)
        .maybeSingle();
        
      if (checkError && !checkError.message.includes('not found')) {
        console.error("Error checking existing user:", checkError);
      }
      
      if (existingUsers) {
        toast.error("Signup failed", {
          description: "This email is already registered"
        });
        throw new Error("Email already registered");
      }
      
      // Proceed with signup
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth/login'
        }
      });
      
      if (error) throw error;
      
      toast.success("Signup successful", {
        description: "Please check your email to confirm your account"
      });
      
      return data;
    } catch (error) {
      const e = error as Error;
      toast.error("Signup failed", {
        description: e.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any auth-related local storage
      localStorage.removeItem("tenant_id");
      
      // No need to set user/session here as the onAuthStateChange will handle it
    } catch (error) {
      const e = error as Error;
      toast.error("Logout failed", {
        description: e.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

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
      {authError ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-red-800 font-medium">Authentication Error</h3>
          <p className="text-red-600">{authError}</p>
          <button 
            onClick={() => refreshSession()}
            className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
          >
            Retry
          </button>
        </div>
      ) : children}
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
