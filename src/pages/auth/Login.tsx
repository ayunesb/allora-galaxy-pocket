
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const { login, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check if we have a session from email confirmation
  useEffect(() => {
    async function checkSession() {
      try {
        // Check for auth code in the URL (from email confirmation)
        if (location.hash && location.hash.includes('access_token')) {
          const { data, error } = await supabase.auth.getSession();
          
          if (data.session && !error) {
            toast.success("Email confirmed successfully!");
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
  }, [location, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (session && !isCheckingSession) {
      navigate("/onboarding");
    }
  }, [session, isCheckingSession, navigate]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await login(email, password);
      toast.success("Logged in successfully!");

      // Fetch canonical user role for redirect after login
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
      toast.error("Login failed", {
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="p-6 max-w-sm mx-auto text-center">
        <p>Checking authentication status...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-sm mx-auto space-y-4">
      <h2 className="text-xl font-bold">Login</h2>
      <Input 
        placeholder="Email" 
        type="email"
        disabled={isLoading}
        onChange={(e) => setEmail(e.target.value)} 
      />
      <Input 
        placeholder="Password" 
        type="password" 
        disabled={isLoading}
        onChange={(e) => setPassword(e.target.value)} 
      />
      <Button 
        className="w-full" 
        onClick={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Login"}
      </Button>
      <div className="flex justify-between text-sm">
        <Button variant="link" className="p-0" onClick={() => navigate("/auth/signup")}>
          Sign up
        </Button>
        <Button variant="link" className="p-0" onClick={() => navigate("/auth/recovery")}>
          Forgot password?
        </Button>
      </div>
    </div>
  );
}
