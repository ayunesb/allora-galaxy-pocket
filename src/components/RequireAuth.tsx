import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) navigate("/auth/login");
      else setSession(data.session);
      setLoading(false);
    };
    checkSession();
  }, [navigate]);

  if (loading) return <div className="p-6">Loading...</div>;
  return children;
}
