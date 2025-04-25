import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ToastService } from '@/services/ToastService';

export function useAuthActions(
  setIsLoading: (loading: boolean) => void,
  setAuthError: (error: string | null) => void
) {
  const [rememberMe, setRememberMe] = useState(false);

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password,
        // Remove persistSession as it's not supported in the current Supabase version
      });
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthError(error.message);
      ToastService.error({
        title: "Login failed",
        description: error.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign up with email and password
   */
  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        // Remove persistSession as it's not supported in the current Supabase version
      });
      
      if (error) throw error;
      
      ToastService.success({
        title: "Sign up successful",
        description: "Please check your email to verify your account"
      });
      
      return data;
    } catch (error: any) {
      console.error('Signup error:', error);
      setAuthError(error.message);
      ToastService.error({
        title: "Sign up failed",
        description: error.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout the user
   */
  const logout = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      ToastService.success({
        title: "Logged out successfully"
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      ToastService.error({
        title: "Logout failed",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Request a password reset email
   */
  const requestPasswordReset = async (email: string) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      ToastService.success({
        title: "Password reset email sent",
        description: "Please check your email for the reset link"
      });
      
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      setAuthError(error.message);
      ToastService.error({
        title: "Password reset failed",
        description: error.message
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh the current session
   */
  const refreshSession = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Session refresh error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    signup,
    logout,
    requestPasswordReset,
    refreshSession,
    rememberMe,
    setRememberMe
  };
}
