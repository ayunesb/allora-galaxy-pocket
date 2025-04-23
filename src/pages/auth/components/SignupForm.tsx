
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { isValidEmail, isValidPassword } from "@/lib/validation";
import EmailField from "./EmailField";
import PasswordField from "./PasswordField";
import RoleSelectorWithAdmin from "./RoleSelectorWithAdmin";
import TermsCheckbox from "./TermsCheckbox";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signupUser } from "../utils/signupUser";
import { supabase } from "@/integrations/supabase/client";

// Only allow manual admin signup with correct token
const ADMIN_INVITE_TOKEN = "launch-secret"; // TODO: Store securely, not hard-coded in production

export default function SignupForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [adminToken, setAdminToken] = useState("");
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
    // Only allow 'admin' with correct invite code
    if (role === "admin" && adminToken !== ADMIN_INVITE_TOKEN) {
      toast.error("Invalid admin invite code");
      return;
    }

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

  // After signup (email confirmation/login), auto-redirect based on user role
  // The parent page should handle this after session is created, but we leave helper here for completeness
  // This pattern ensures the correct flow for post-signup onboarding
  const redirectAfterSignup = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (data?.role === "client") navigate("/onboarding");
    else if (data?.role === "developer") navigate("/plugins/generator");
    else if (data?.role === "admin") navigate("/admin/ai-decisions");
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
          <RoleSelectorWithAdmin
            role={role}
            onRoleChange={setRole}
            adminToken={adminToken}
            onAdminTokenChange={setAdminToken}
            allowAdmin={true}
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
            onClick={() => redirectAfterSignup()}
            aria-label="Proceed to onboarding"
          >
            Proceed to Onboarding
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
