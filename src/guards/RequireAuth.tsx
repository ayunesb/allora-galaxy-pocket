import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { LoadingState } from "@/components/ui/loading-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSessionRefresh } from "@/hooks/useSessionRefresh";
import { useOnboardingCheck } from "@/hooks/useOnboardingCheck";
import { ToastService } from "@/services/ToastService";
import { AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, session, isLoading: authLoading, refreshSession } = useAuth();
  const { tenant, isLoading: tenantLoading, refreshTenant } = useTenant();
  const location = useLocation();
  const [shouldCheckOnboarding, setShouldCheckOnboarding] = useState(true);
  const [authAttempts, setAuthAttempts] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [navigationAttempted, setNavigationAttempted] = useState(false);
  
  const skipOnboardingCheck = location.pathname === "/onboarding" || 
                             location.pathname === "/workspace" ||
                             location.pathname.startsWith("/auth/");
  
  useSessionRefresh();

  const { data: onboardingComplete, isLoading: onboardingLoading } = useOnboardingCheck(
    user,
    tenant,
    shouldCheckOnboarding && !skipOnboardingCheck
  );

  useEffect(() => {
    if (navigationAttempted) {
      return;
    }

    if (!authLoading && !tenantLoading && !user && !location.pathname.startsWith("/auth/")) {
      setNavigationAttempted(true);
      console.log("RequireAuth: User not logged in, redirecting to login");
    }

    if (!authLoading && !tenantLoading && user && !tenant && 
        !location.pathname.startsWith("/auth/") && 
        location.pathname !== "/onboarding" && 
        location.pathname !== "/workspace") {
      setNavigationAttempted(true);
      console.log("RequireAuth: No tenant selected, redirecting to workspace");
    }

    if (!authLoading && !tenantLoading && !onboardingLoading && 
        user && tenant && onboardingComplete === false && !skipOnboardingCheck) {
      setNavigationAttempted(true);
      console.log("RequireAuth: Onboarding incomplete, redirecting to onboarding");
    }

    return () => {
      setNavigationAttempted(false);
    };
  }, [user, tenant, authLoading, tenantLoading, onboardingLoading, 
      onboardingComplete, location.pathname, skipOnboardingCheck, navigationAttempted]);

  useEffect(() => {
    if (!user?.id || !tenant?.id || 
        location.pathname.startsWith('/auth/') || 
        location.pathname === '/workspace') return;

    const validateTenantAccess = async () => {
      try {
        const { data, error } = await supabase.rpc(
          "check_tenant_user_access_safe",
          { tenant_uuid: tenant.id, user_uuid: user.id }
        );

        if (error) {
          console.error("Error validating tenant access:", error);
          return;
        }

        if (!data) {
          console.error(`User ${user.id} attempted unauthorized access to tenant ${tenant.id}`);
          
          refreshTenant();
          localStorage.removeItem('tenant_id');
          
          ToastService.error({
            title: "Access denied",
            description: "You don't have access to this workspace",
          });

          setNavigationAttempted(true);
        }
      } catch (error) {
        console.error("Error validating tenant access:", error);
      }
    };

    validateTenantAccess();
  }, [user?.id, tenant?.id, location.pathname]);

  const handleRetry = async () => {
    try {
      setAuthAttempts(prev => prev + 1);
      setAuthError(null);
      await refreshSession();
      
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

  const handleReload = () => {
    window.location.reload();
  };

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
        <div className="text-center space-y-4">
          <LoadingState size="md" message={authLoading ? "Loading authentication..." : "Preparing application..."} />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReload}
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-3 w-3" /> Refresh Page
          </Button>
        </div>
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

  return <>{children}</>;
}
