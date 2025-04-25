
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { ToastService } from "@/services/ToastService";

export function useAuthActions(
  setIsLoading: (loading: boolean) => void,
  setAuthError: (error: string | null) => void
) {
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        let errorMessage = error.message;
        
        if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please check your email to confirm your account before logging in";
        } else if (error.message.includes("Invalid login")) {
          errorMessage = "Invalid email or password";
        }
        
        ToastService.error({
          title: "Login failed",
          description: errorMessage
        });
        throw error;
      }
    } catch (error) {
      const e = error as Error;
      console.error("Login error:", e);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string): Promise<void> => {
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
        ToastService.error({
          title: "Signup failed",
          description: "This email is already registered"
        });
        throw new Error("Email already registered");
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth/login'
        }
      });
      
      if (error) throw error;
      
      ToastService.success({
        title: "Signup successful",
        description: "Please check your email to confirm your account"
      });
    } catch (error) {
      const e = error as Error;
      ToastService.error({
        title: "Signup failed",
        description: e.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any auth-related local storage
      localStorage.removeItem("tenant_id");
      ToastService.success({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
    } catch (error) {
      const e = error as Error;
      ToastService.error({
        title: "Logout failed",
        description: e.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Session refresh error:", error);
        ToastService.error({
          title: "Failed to refresh authentication",
          description: error.message
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Session refresh exception:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    signup,
    logout,
    refreshSession
  };
}
