import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastService } from "@/services/ToastService";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSystemLogs } from "@/hooks/useSystemLogs";

export default function Login() {
  const { login, session, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { logActivity } = useSystemLogs();

  useEffect(() => {
    async function checkSession() {
      try {
        if (location.hash && location.hash.includes('access_token')) {
          const { data, error } = await supabase.auth.getSession();
          
          if (data.session && !error) {
            ToastService.success({
              title: "Email confirmed",
              description: "You have successfully confirmed your email"
            });
            
            logActivity({
              event_type: "AUTH_EMAIL_CONFIRMED",
              message: "User confirmed email address"
            });
            
            navigate("/onboarding");
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsCheckingSession(false);
      }
    }
    
    checkSession();
  }, [location, navigate, logActivity]);

  useEffect(() => {
    if (session && !isCheckingSession) {
      logActivity({
        event_type: "AUTH_AUTO_REDIRECT",
        message: "User automatically redirected after authentication"
      });
      navigate("/onboarding");
    }
  }, [session, isCheckingSession, navigate, logActivity]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password");
      return;
    }
    
    setErrorMessage(null);
    try {
      setIsLoading(true);
      await login(email, password);
      
      logActivity({
        event_type: "AUTH_LOGIN_SUCCESS",
        message: "User logged in successfully"
      });
      
      const { data: roleData, error } = await supabase.rpc("get_user_role");
      if (!error && roleData) {
        if (roleData === "client") navigate("/onboarding");
        else if (roleData === "developer") navigate("/plugins/generator");
        else if (roleData === "admin") navigate("/admin/ai-decisions");
        else navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMessage(err.message || "Login failed. Please check your credentials.");
      
      logActivity({
        event_type: "AUTH_LOGIN_FAILED",
        message: `Login failed: ${err.message}`,
        meta: { error: err.message }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (authLoading || isCheckingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="w-full max-w-md p-6 space-y-4">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-sm text-muted-foreground">Checking authentication status...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-background">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Login</h2>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>
        
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <Input 
              id="email"
              placeholder="Your email" 
              type="email"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <Button 
                variant="link" 
                className="p-0 h-auto text-xs"
                onClick={() => navigate("/auth/reset-password")}
              >
                Forgot password?
              </Button>
            </div>
            <Input 
              id="password"
              placeholder="Your password" 
              type="password" 
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Signing in...
              </>
            ) : "Sign In"}
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto"
              onClick={() => navigate("/auth/signup")}
            >
              Sign up
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
}
