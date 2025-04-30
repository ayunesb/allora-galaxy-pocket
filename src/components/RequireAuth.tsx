import { useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth/login");
      } else {
        setSession(data.session);
        setLoading(false);
      }
    };
    check();
  }, [navigate]);

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;

  return <>{children}</>;
}
