
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  // Don't redirect while checking auth status
  if (isLoading) {
    return null;
  }
  
  if (!user) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
