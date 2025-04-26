
import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSessionRefresh } from "@/hooks/useSessionRefresh";
import { useOnboardingCheck } from "@/hooks/useOnboardingCheck";
import { ToastService } from "@/services/ToastService";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, session, isLoading: authLoading, refreshSession } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const location = useLocation();
  const [shouldCheckOnboarding, setShouldCheckOnboarding] = useState(true);
  const [authAttempts, setAuthAttempts] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const skipOnboardingCheck = location.pathname === "/onboarding" || 
                             location.pathname === "/workspace" ||
                             location.pathname.startsWith("/auth/");
  
  // Use session refresh hook
  useSessionRefresh();

  // Onboarding check will be activated when user and tenant are available
  const { data: onboardingComplete, isLoading: onboardingLoading } = useOnboardingCheck(
    user,
    tenant,
    shouldCheckOnboarding && !skipOnboardingCheck
  );

  const handleRetry = async () => {
    try {
      setAuthAttempts(prev => prev + 1);
      setAuthError(null);
      await refreshSession();
      
      // Log activity if implementation exists
      console.log("Authentication retry attempt", authAttempts + 1);
    } catch (error) {
      const e = error as Error;
      setAuthError(e.message || "Authentication failed after retry");
      
      ToastService.error({
        title: "Authentication failed",
        description: "Please try logging in again"
      });
    }
  };

  // Provide detailed console logging for debugging
  console.log("RequireAuth state:", {
    user: !!user,
    tenant: !!tenant,
    authLoading,
    tenantLoading,
    onboardingComplete,
    onboardingLoading,
    path: location.pathname
  });

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>{authError}</p>
            <div className="flex space-x-2 mt-2">
              <Button size="sm" variant="outline" onClick={handleRetry}>
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

  if (authLoading || tenantLoading || (shouldCheckOnboarding && !skipOnboardingCheck && onboardingLoading)) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <LoadingSpinner size={40} label={authLoading ? "Loading authentication..." : "Preparing application..."} />
      </div>
    );
  }

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
    ToastService.warning({
      title: "Workspace required",
      description: "Please select or create a workspace to continue"
    });
    return <Navigate to="/workspace" state={{ from: location.pathname }} replace />;
  }

  if (onboardingComplete === false && !skipOnboardingCheck) {
    console.log("RequireAuth: Onboarding incomplete, redirecting to onboarding");
    ToastService.info({
      title: "Complete your setup",
      description: "Please finish onboarding to continue"
    });
    return <Navigate to="/onboarding" state={{ from: location.pathname }} replace />;
  }

  // All checks passed, render the protected component
  return <>{children}</>;
}
