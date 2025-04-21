
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login(email, password);
      toast.success("Logged in successfully!");
      navigate("/startup");
    } catch (err: any) {
      toast.error("Login failed", {
        description: err.message
      });
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto space-y-4">
      <h2 className="text-xl font-bold">Login</h2>
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
        onClick={handleLogin}
      >
        Login
      </Button>
      <p className="text-sm text-center">
        Don't have an account?{" "}
        <Button variant="link" className="p-0" onClick={() => navigate("/auth/signup")}>
          Sign up
        </Button>
      </p>
    </div>
  );
}
