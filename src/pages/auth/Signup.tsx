
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { isValidEmail, isValidPassword } from "@/lib/validation";
import EmailField from "./components/EmailField";
import PasswordField from "./components/PasswordField";
import RoleSelector from "./components/RoleSelector";
import TermsCheckbox from "./components/TermsCheckbox";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signupUser } from "./utils/signupUser";

// Allowed roles—omit admin by default
const roleOptions = [
  { value: "client", label: "🧑‍💼 Client (User/Founder)" },
  { value: "developer", label: "👨‍💻 Developer (Agent/Plugin Builder)" },
  // To allow admin: add conditional logic or secret token check
  // { value: "admin", label: "👨‍✈️ Admin (System)" }
];

export default function Signup() {
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
    // Uncomment to prevent manual admin signup:
    // if (role === "admin") {
    //   toast.error("Admin access must be granted by a system administrator.");
    //   return;
    // }

    try {
      setIsLoading(true);
      await signupUser(email, password, role);
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
          <Alert className="bg-blue-50 border-blue-200" role="alert">
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
          onSubmit={e => {
            e.preventDefault();
            handleSignup();
          }}
          className="space-y-4"
        >
          <EmailField
            value={email}
            onChange={setEmail}
            disabled={isLoading || showEmailConfirmationAlert}
          />
          <PasswordField
            value={password}
            onChange={setPassword}
            disabled={isLoading || showEmailConfirmationAlert}
          />
          <RoleSelector
            value={role}
            onChange={setRole}
            options={roleOptions}
            disabled={isLoading || showEmailConfirmationAlert}
          />
          <TermsCheckbox
            checked={agreedToTerms}
            onChange={setAgreedToTerms}
            disabled={isLoading || showEmailConfirmationAlert}
          />
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
