
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const location = useLocation();
  
  // Don't redirect while checking auth status
  if (authLoading || tenantLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={40} label="Loading..." />
      </div>
    );
  }
  
  // If not logged in, redirect to onboarding
  if (!user) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }
  
  // If logged in but no tenant selected, redirect to workspace selection
  if (!tenant) {
    return <Navigate to="/workspace" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
