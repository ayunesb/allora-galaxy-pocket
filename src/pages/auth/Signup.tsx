
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      await signup(email, password);
      toast.success("Signup successful!", {
        description: "Please check your email to confirm your account"
      });
      navigate("/auth/login");
    } catch (err: any) {
      toast.error("Signup failed", {
        description: err.message
      });
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto space-y-4">
      <h2 className="text-xl font-bold">Create Account</h2>
      <Input 
        placeholder="Email" 
        type="email"
        onChange={(e) => setEmail(e.target.value)} 
      />
      <Input 
        placeholder="Password" 
        type="password" 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <Button 
        className="w-full" 
        onClick={handleSignup}
      >
        Sign up
      </Button>
      <p className="text-sm text-center">
        Already have an account?{" "}
        <Button variant="link" className="p-0" onClick={() => navigate("/auth/login")}>
          Login
        </Button>
      </p>
    </div>
  );
}
