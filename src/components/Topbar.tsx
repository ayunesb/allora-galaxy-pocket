
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { LogOut } from "lucide-react";

export default function Topbar() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email || "User");
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm">
      <h1 className="text-xl font-bold text-gray-800">Allora OS</h1>

      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-600">{email}</div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
}
