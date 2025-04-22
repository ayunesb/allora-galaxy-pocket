
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Alert,
  AlertDescription 
} from "@/components/ui/alert";
import { toast } from "@/components/ui/sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { isValidEmail, isValidPassword } from "@/lib/validation";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailConfirmationAlert, setShowEmailConfirmationAlert] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSignup = async () => {
    if (!agreedToTerms) {
      toast.error("Please agree to the terms", {
        description: "You must accept the terms to create an account"
      });
      return;
    }

    // Validate form inputs
    if (!isValidEmail(email)) {
      toast.error("Invalid email", {
        description: "Please enter a valid email address"
      });
      return;
    }

    if (!isValidPassword(password)) {
      toast.error("Invalid password", {
        description: "Password must be at least 8 characters long"
      });
      return;
    }

    try {
      setIsLoading(true);
      await signup(email, password);
      
      toast.success("Signup successful!", {
        description: "Please check your email to confirm your account"
      });
      
      setShowEmailConfirmationAlert(true);
    } catch (err: any) {
      toast.error("Signup failed", {
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main aria-labelledby="signup-heading" className="p-6 max-w-sm mx-auto space-y-4">
      <h1 id="signup-heading" className="text-xl font-bold">Create Account</h1>
      
      {showEmailConfirmationAlert && (
        <Alert className="bg-blue-50 border-blue-200" role="alert">
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
      
      <div role="form" aria-label="Sign up form">
        <Input 
          aria-label="Email address"
          placeholder="Email" 
          type="email"
          onChange={(e) => setEmail(e.target.value)} 
          disabled={isLoading || showEmailConfirmationAlert}
        />
        <Input 
          aria-label="Password"
          placeholder="Password" 
          type="password" 
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading || showEmailConfirmationAlert} 
        />

        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            disabled={isLoading || showEmailConfirmationAlert}
            aria-label="Accept terms and conditions"
          />
          <label
            htmlFor="terms"
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I agree to the{" "}
            <Link to="/legal/terms" className="font-medium text-primary hover:underline">
              Terms of Use
            </Link>
            ,{" "}
            <Link to="/legal/privacy" className="font-medium text-primary hover:underline">
              Privacy Policy
            </Link>
            , and{" "}
            <Link to="/legal/cookie" className="font-medium text-primary hover:underline">
              Cookie Policy
            </Link>
          </label>
        </div>

        <Button 
          className="w-full" 
          onClick={handleSignup}
          disabled={isLoading || showEmailConfirmationAlert || !agreedToTerms}
          aria-label={isLoading ? "Signing up..." : "Sign up"}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Signing up...
            </>
          ) : "Sign up"}
        </Button>
        
        {showEmailConfirmationAlert && (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => navigate("/auth/login")}
            aria-label="Proceed to login page"
          >
            Proceed to Login
          </Button>
        )}
        
        <nav className="text-sm text-center">
          Already have an account?{" "}
          <Button 
            variant="link" 
            className="p-0" 
            onClick={() => navigate("/auth/login")}
            aria-label="Go to login page"
          >
            Login
          </Button>
        </nav>
      </div>
    </main>
  );
}
