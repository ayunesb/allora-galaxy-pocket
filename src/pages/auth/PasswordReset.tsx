
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, Loader2, CheckCircle } from "lucide-react";

// This page handles both requesting a password reset and setting a new password
export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingToken, setIsProcessingToken] = useState(true);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Extract access token from URL hash
  useEffect(() => {
    const extractToken = async () => {
      try {
        // Check if we have a hash with an access token (from password reset email)
        if (location.hash && location.hash.includes('access_token')) {
          const hashParams = new URLSearchParams(location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          setResetToken(accessToken);
        } else {
          // If no token in URL, we're just on the request password page
          setIsProcessingToken(false);
        }
      } catch (error) {
        console.error("Error processing reset token:", error);
        toast.error("Invalid password reset link");
        setIsProcessingToken(false);
      } finally {
        setIsProcessingToken(false);
      }
    };

    extractToken();
  }, [location]);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    // Add more validation as needed
    return null;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // User has a token, update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setResetSuccess(true);
      toast.success("Password updated successfully");
      
      // After 3 seconds, redirect to login
      setTimeout(() => {
        navigate("/auth/login");
      }, 3000);
    } catch (error: any) {
      toast.error("Error resetting password", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // User is requesting a reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/recovery`,
      });
      
      if (error) throw error;
      
      setResetSuccess(true);
      toast.success("Password reset email sent, please check your inbox");
      
      // Clear the email field
      setEmail("");
    } catch (error: any) {
      toast.error("Error requesting password reset", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show success states when completed
  if (resetSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <CardTitle>Success!</CardTitle>
            </div>
            <CardDescription>
              {resetToken ? 
                "Your password has been reset successfully." : 
                "Password reset instructions have been sent to your email."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              {resetToken ? 
                "You will be redirected to login in a few seconds..." : 
                "Please check your inbox and follow the instructions to reset your password."}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate("/auth/login")}
            >
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isProcessingToken) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">Processing your password reset request...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{resetToken ? "Reset Your Password" : "Password Recovery"}</CardTitle>
          <CardDescription>
            {resetToken 
              ? "Please enter your new password below." 
              : "Enter your email and we'll send you a password reset link."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={resetToken ? handleResetPassword : handleRequestReset} className="space-y-4">
            {resetToken ? (
              <>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    minLength={8}
                  />
                </div>
                
                {/* Password requirements */}
                <div className="rounded-md bg-muted p-3">
                  <div className="text-sm font-medium mb-2">Password Requirements:</div>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li className={`flex items-center ${newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                      <CheckCircle className={`h-3 w-3 mr-2 ${newPassword.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}`} />
                      At least 8 characters
                    </li>
                    <li className={`flex items-center ${/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}`}>
                      <CheckCircle className={`h-3 w-3 mr-2 ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-muted-foreground'}`} />
                      Contains uppercase letter
                    </li>
                    <li className={`flex items-center ${/[0-9]/.test(newPassword) ? 'text-green-600' : ''}`}>
                      <CheckCircle className={`h-3 w-3 mr-2 ${/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-muted-foreground'}`} />
                      Contains number
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {resetToken ? "Updating Password..." : "Sending Reset Link..."}
                </>
              ) : (
                resetToken ? "Update Password" : "Send Reset Link"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="ghost"
            className="flex items-center"
            onClick={() => navigate("/auth/login")}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
          
          {!resetToken && (
            <Button
              type="button"
              variant="link"
              className="text-xs"
              onClick={() => navigate("/auth/signup")}
              disabled={isLoading}
            >
              Don't have an account? Sign up
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
