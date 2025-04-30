import { useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

type RequireAuthProps = {
  children: ReactNode;
};

export default function RequireAuth({ children }: RequireAuthProps) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth/login");
      } else {
        setSession(data.session);
      }
      setLoading(false);
    };

    checkSession();
  }, [navigate]);

  if (loading) {
    return <div className="p-6 text-gray-600">Checking authentication...</div>;
  }

  return <>{children}</>;
}
