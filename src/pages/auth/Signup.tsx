
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

      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          checked={agreedToTerms}
          onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
          disabled={isLoading || showEmailConfirmationAlert}
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
