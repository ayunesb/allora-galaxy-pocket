
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import LiveSystemVerification from "@/components/LiveSystemVerification";
import { useSessionRefresh } from "@/hooks/auth/useSessionRefresh";
import { useOnboardingCheck } from "@/hooks/auth/useOnboardingCheck";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, session, isLoading: authLoading, refreshSession } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const location = useLocation();
  const [shouldCheckOnboarding, setShouldCheckOnboarding] = useState(false);
  const [authAttempts, setAuthAttempts] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Special cases where we don't need to check onboarding
  const skipOnboardingCheck = location.pathname === "/onboarding" || 
                             location.pathname === "/workspace" ||
                             location.pathname.startsWith("/auth/");
  
  // Use session refresh hook
  useSessionRefresh();

  // Use onboarding check hook
  const { data: onboardingComplete, isLoading: onboardingLoading } = useOnboardingCheck(
    user,
    tenant,
    shouldCheckOnboarding
  );

  // Handle auth error display
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>{authError}</p>
            <div className="flex space-x-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => refreshSession()}>
                Retry
              </Button>
              <Button size="sm" onClick={() => window.location.href = "/auth/login"}>
                Login
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show loading state
  if (authLoading || tenantLoading || (shouldCheckOnboarding && onboardingLoading)) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <LoadingSpinner size={40} label={authLoading ? "Loading authentication..." : "Preparing application..."} />
      </div>
    );
  }

  // Handle routing logic
  if (!user) {
    if (location.pathname.startsWith("/auth/")) {
      return <>{children}</>;
    }
    
    console.log("RequireAuth: User not logged in, redirecting to login");
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  if (!tenant && !location.pathname.startsWith("/auth/")) {
    if (location.pathname === "/onboarding" || location.pathname === "/workspace") {
      return <>{children}</>;
    }
    
    console.log("RequireAuth: No tenant selected, redirecting to workspace");
    return <Navigate to="/workspace" state={{ from: location.pathname }} replace />;
  }

  if (shouldCheckOnboarding && onboardingComplete === false && !skipOnboardingCheck) {
    console.log("RequireAuth: Onboarding incomplete, redirecting to onboarding");
    return <Navigate to="/onboarding" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
