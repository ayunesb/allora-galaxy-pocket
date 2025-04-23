
import { useEffect, useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";

export default function UnauthorizedPage() {
  const [role, setRole] = useState("client");
  const { role: backendRole } = useUserRole();

  useEffect(() => {
    if (backendRole) {
      setRole(backendRole);
      localStorage.setItem("user_role", backendRole);
    } else {
      const r = localStorage.getItem("user_role") || "client";
      setRole(r);
    }
  }, [backendRole]);

  const tips: Record<string, string> = {
    client: "This section is only for team builders and admins.",
    developer: "You may need admin access to view this content.",
    admin: "You shouldn’t see this… if you do, contact support."
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="p-10 w-full max-w-md text-center rounded border bg-white/80 shadow">
        <h1 className="text-3xl font-bold mb-2">🚫 Access Denied</h1>
        <p className="text-muted-foreground mb-4">You don't have permission to view this page.</p>
        <p className="text-sm italic text-muted-foreground">
          {tips[role] ?? tips["client"]}
        </p>
      </div>
    </div>
  );
}
