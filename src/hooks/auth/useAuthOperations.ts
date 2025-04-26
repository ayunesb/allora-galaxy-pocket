
import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';

export function useAuthOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      
      return data?.session;
    } catch (error: any) {
      console.error("Failed to refresh session:", error);
      setError(error.message || "Failed to refresh authentication session");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    refreshSession
  };
}
