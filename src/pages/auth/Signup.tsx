
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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

// Add allowed roles to choose from, omitting 'admin' from direct registration for now
const roleOptions = [
  { value: "client", label: "🧑‍💼 Client (User/Founder)" },
  { value: "developer", label: "👨‍💻 Developer (Agent/Plugin Builder)" },
  // To allow admin: Uncomment below or add conditional protection as needed
  // { value: "admin", label: "👨‍✈️ Admin (System)" }
];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
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

    // Example: Prevent admin self-enrollment (optional)
    // if (role === "admin") {
    //   toast.error("Admin access must be granted by a system administrator.");
    //   return;
    // }

    try {
      setIsLoading(true);
      // Use supabase directly to get user id from signup response
      const { data: signUpUser, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });
      if (signUpError || !signUpUser?.user?.id) {
        throw signUpError || new Error("No user returned from sign up");
      }
      // Insert role to user_roles if signup succeeded
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: signUpUser.user.id,
        role
      });
      if (roleError) {
        throw roleError;
      }

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
    <main 
      aria-labelledby="signup-heading" 
      className="min-h-screen flex items-center justify-center p-6"
    >
      <div className="w-full max-w-md space-y-4">
        <header>
          <h1 
            id="signup-heading" 
            className="text-2xl font-bold text-center"
          >
            Create Your Account
          </h1>
        </header>
        
        {showEmailConfirmationAlert && (
          <Alert 
            className="bg-blue-50 border-blue-200" 
            role="alert"
          >
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <h2 className="text-sm font-semibold text-blue-800">
                Email Confirmation Required
              </h2>
              <p className="text-xs text-blue-700 mt-1">
                Please check your inbox and click the confirmation link.
              </p>
            </AlertDescription>
          </Alert>
        )}
        
        <form 
          role="form" 
          aria-label="Sign up form" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSignup();
          }}
          className="space-y-4"
        >
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <Input 
              id="email"
              aria-label="Email address"
              placeholder="Enter your email" 
              type="email"
              aria-required="true"
              onChange={(e) => setEmail(e.target.value)} 
              disabled={isLoading || showEmailConfirmationAlert}
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <Input 
              id="password"
              aria-label="Password"
              placeholder="Enter your password" 
              type="password" 
              aria-required="true"
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || showEmailConfirmationAlert} 
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Your Role
            </label>
            <select
              id="role"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isLoading || showEmailConfirmationAlert}
              aria-label="User Role"
            >
              {roleOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              name="terms"
              aria-label="Accept terms and conditions"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              disabled={isLoading || showEmailConfirmationAlert}
            />
            <label 
              htmlFor="terms" 
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{" "}
              <Link 
                to="/legal/terms" 
                className="underline"
                aria-label="View Terms of Use"
              >
                Terms of Use
              </Link>
              ,{" "}
              <Link 
                to="/legal/privacy" 
                className="underline"
                aria-label="View Privacy Policy"
              >
                Privacy Policy
              </Link>
              , and{" "}
              <Link 
                to="/legal/cookie" 
                className="underline"
                aria-label="View Cookie Policy"
              >
                Cookie Policy
              </Link>
            </label>
          </div>

          <Button 
            type="submit"
            className="w-full" 
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
        </form>
        
        {showEmailConfirmationAlert && (
          <Button
            variant="outline"
            className="w-full mt-2"
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

