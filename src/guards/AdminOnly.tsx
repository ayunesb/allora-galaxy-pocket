
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function AdminOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user?.email?.includes("admin")) {
    return <Navigate to="/startup" replace />;
  }
  
  return <>{children}</>;
}
