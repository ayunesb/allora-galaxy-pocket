
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function PasswordReset() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingToken, setIsProcessingToken] = useState(true);
  const [resetToken, setResetToken] = useState<string | null>(null);
  
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (resetToken) {
        // User has a token, update the password
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        
        if (error) throw error;
        
        toast.success("Password updated successfully");
        navigate("/auth/login");
      } else {
        // User is requesting a reset email
        const { error } = await supabase.auth.resetPasswordForEmail(newPassword, {
          redirectTo: `${window.location.origin}/auth/recovery`,
        });
        
        if (error) throw error;
        
        toast.success("Password reset email sent, please check your inbox");
      }
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
    
    if (!newPassword || !newPassword.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // User is requesting a reset email
      const { error } = await supabase.auth.resetPasswordForEmail(newPassword, {
        redirectTo: `${window.location.origin}/auth/recovery`,
      });
      
      if (error) throw error;
      
      toast.success("Password reset email sent, please check your inbox");
    } catch (error: any) {
      toast.error("Error requesting password reset", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
      setNewPassword("");
    }
  };

  if (isProcessingToken) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">Processing your password reset...</p>
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
              </>
            ) : (
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
            
            <Button
              type="button"
              variant="ghost"
              className="w-full mt-2"
              onClick={() => navigate("/auth/login")}
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
