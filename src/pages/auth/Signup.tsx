
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailConfirmationAlert, setShowEmailConfirmationAlert] = useState(false);

  const handleSignup = async () => {
    try {
      setIsLoading(true);
      await signup(email, password);
      
      // Show success message and email confirmation alert
      toast.success("Signup successful!", {
        description: "Please check your email to confirm your account"
      });
      
      setShowEmailConfirmationAlert(true);
      // Don't redirect yet - wait for email confirmation
    } catch (err: any) {
      toast.error("Signup failed", {
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto space-y-4">
      <h2 className="text-xl font-bold">Create Account</h2>
      
      {showEmailConfirmationAlert && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <p className="text-sm text-blue-800">
              <strong>Email confirmation required</strong> 
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Please check your inbox and click the confirmation link.
              <br/>
              <span className="font-semibold">Important:</span> If the link redirects to localhost, 
              please come back to this app and login with your email and password.
            </p>
          </AlertDescription>
        </Alert>
      )}
      
      <Input 
        placeholder="Email" 
        type="email"
        onChange={(e) => setEmail(e.target.value)} 
        disabled={isLoading || showEmailConfirmationAlert}
      />
      <Input 
        placeholder="Password" 
        type="password" 
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading || showEmailConfirmationAlert} 
      />
      <Button 
        className="w-full" 
        onClick={handleSignup}
        disabled={isLoading || showEmailConfirmationAlert}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing up...
          </>
        ) : "Sign up"}
      </Button>
      
      {showEmailConfirmationAlert && (
        <Button
          className="w-full"
          variant="outline"
          onClick={() => navigate("/auth/login")}
        >
          Proceed to Login
        </Button>
      )}
      
      <p className="text-sm text-center">
        Already have an account?{" "}
        <Button variant="link" className="p-0" onClick={() => navigate("/auth/login")}>
          Login
        </Button>
      </p>
    </div>
  );
}
