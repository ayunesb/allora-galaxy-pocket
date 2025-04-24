
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, session, isLoading: authLoading, refreshSession } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const location = useLocation();
  const [shouldCheckOnboarding, setShouldCheckOnboarding] = useState(false);
  const redirectedRef = useRef(false);
  const onboardingCheckDoneRef = useRef(false);
  const stableStateRef = useRef(false);
  const lastRefreshAttemptRef = useRef<number>(0);
  const [authAttempts, setAuthAttempts] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Special cases where we don't need to check onboarding
  const skipOnboardingCheck = location.pathname === "/onboarding" || 
                             location.pathname === "/workspace" ||
                             location.pathname.startsWith("/auth/");
  
  // Handle session refresh if token is close to expiry (30 minutes)
  useEffect(() => {
    const tokenRefreshCheck = async () => {
      if (!session) return;
      
      const now = new Date().getTime();
      const expiresAt = (session.expires_at || 0) * 1000;
      const timeRemaining = expiresAt - now;
      const thirtyMinutes = 30 * 60 * 1000;
      
      // Avoid frequent refresh attempts
      if (now - lastRefreshAttemptRef.current < 60000) return;

      if (timeRemaining < thirtyMinutes && timeRemaining > 0) {
        console.log("Session expiring soon, refreshing token...");
        lastRefreshAttemptRef.current = now;
        await refreshSession();
      }
    };
    
    tokenRefreshCheck();
    // Run check every 5 minutes
    const interval = setInterval(tokenRefreshCheck, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [session, refreshSession]);
  
  // Delay onboarding check until both user and tenant are loaded
  useEffect(() => {
    if (user && tenant?.id && !authLoading && !tenantLoading && !shouldCheckOnboarding && !skipOnboardingCheck) {
      setShouldCheckOnboarding(true);
    }

    // Mark state as stable once all loading is complete
    if (!authLoading && !tenantLoading) {
      stableStateRef.current = true;
    }
  }, [user, tenant?.id, authLoading, tenantLoading, shouldCheckOnboarding, skipOnboardingCheck]);
  
  // Handle session persistence issues
  useEffect(() => {
    if (authLoading || user || authAttempts > 2) return;
    
    const attemptReauth = async () => {
      console.log(`Auth attempt ${authAttempts + 1}: Trying to refresh session...`);
      setAuthAttempts(prev => prev + 1);
      try {
        const success = await refreshSession();
        if (!success && authAttempts >= 2) {
          setAuthError("Unable to authenticate. Please try logging in again.");
        }
      } catch (err) {
        if (authAttempts >= 2) {
          setAuthError("Authentication error. Please try logging in again.");
        }
      }
    };
    
    if (authAttempts < 3) {
      attemptReauth();
    }
  }, [authLoading, user, authAttempts, refreshSession]);
  
  // Check onboarding status when user and tenant are available
  const { data: onboardingComplete, isLoading: onboardingLoading } = useQuery({
    queryKey: ['onboarding-status', tenant?.id, user?.id],
    queryFn: async () => {
      if (!user || !tenant?.id) return false;
      
      try {
        // Check for company profile
        const { data: companyProfile, error: companyError } = await supabase
          .from('company_profiles')
          .select('id')
          .eq('tenant_id', tenant.id)
          .maybeSingle();

        if (companyError) {
          console.error("Error checking company profile:", companyError);
          return false;
        }

        // Check for persona profile
        const { data: personaProfile, error: personaError } = await supabase
          .from('persona_profiles')
          .select('id')
          .eq('tenant_id', tenant.id)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (personaError) {
          console.error("Error checking persona profile:", personaError);
          return false;
        }

        const isComplete = !!companyProfile && !!personaProfile;
        onboardingCheckDoneRef.current = true;
        return isComplete;
      } catch (err) {
        console.error("Error checking onboarding status:", err);
        return false;
      }
    },
    enabled: shouldCheckOnboarding,
    retry: 2,
    staleTime: 30000 // Cache for 30 seconds
  });
  
  // Log routing state to help with debugging
  useEffect(() => {
    console.log("RequireAuth routing state:", {
      path: location.pathname,
      user: user ? "authenticated" : "unauthenticated",
      tenant: tenant ? "selected" : "not selected",
      authLoading,
      tenantLoading,
      onboardingLoading,
      onboardingComplete,
      shouldCheckOnboarding,
      redirected: redirectedRef.current,
      skipOnboardingCheck,
      sessionExpiry: session?.expires_at ? new Date((session.expires_at) * 1000).toISOString() : 'none',
      authAttempts
    });
  }, [location.pathname, user, tenant, authLoading, tenantLoading, onboardingLoading, 
      onboardingComplete, shouldCheckOnboarding, session, authAttempts]);
  
  // Decide whether to show loading state
  const showLoading = authLoading || 
    tenantLoading || 
    (shouldCheckOnboarding && onboardingLoading);
  
  // If already redirected, don't process again
  if (redirectedRef.current) {
    return <>{children}</>;
  }

  // Show auth error if we've tried multiple times
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

  // Don't redirect while checking auth status or before state is stable
  if (showLoading || !stableStateRef.current) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <LoadingSpinner size={40} label={showLoading ? "Loading authentication..." : "Preparing application..."} />
      </div>
    );
  }
  
  // Allow access to workspace page even without login for certain paths
  if (location.pathname === "/workspace" || location.pathname.startsWith("/auth/")) {
    // If already on workspace page, just show it
    return <>{children}</>;
  }
  
  // If not logged in, redirect to auth page
  if (!user) {
    // Special case: already on auth pages
    if (location.pathname.startsWith("/auth/")) {
      return <>{children}</>;
    }
    
    console.log("RequireAuth: User not logged in, redirecting to login");
    redirectedRef.current = true;
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }
  
  // If logged in but no tenant selected, redirect to workspace selection
  if (!tenant) {
    // Special case: already on onboarding or workspace page
    if (location.pathname === "/onboarding" || location.pathname === "/workspace") {
      return <>{children}</>;
    }
    
    console.log("RequireAuth: No tenant selected, redirecting to workspace");
    redirectedRef.current = true;
    return <Navigate to="/workspace" state={{ from: location.pathname }} replace />;
  }

  // If onboarding check completed and it's not complete and we're not already on the onboarding page,
  // redirect to onboarding
  if (shouldCheckOnboarding && 
      onboardingCheckDoneRef.current &&
      onboardingComplete === false && 
      !skipOnboardingCheck) {
    console.log("RequireAuth: Onboarding incomplete, redirecting to onboarding");
    redirectedRef.current = true;
    return <Navigate to="/onboarding" state={{ from: location.pathname }} replace />;
  }

  // Otherwise, show the protected page
  return <>{children}</>;
}
