
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useRef } from "react";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const location = useLocation();
  const [shouldCheckOnboarding, setShouldCheckOnboarding] = useState(false);
  const redirectedRef = useRef(false);
  const onboardingCheckDoneRef = useRef(false);
  
  // Special cases where we don't need to check onboarding
  const skipOnboardingCheck = location.pathname === "/onboarding" || 
                             location.pathname === "/workspace";
  
  // Only enable onboarding check when both user and tenant are loaded
  useEffect(() => {
    if (user && tenant?.id && !authLoading && !tenantLoading && !shouldCheckOnboarding && !skipOnboardingCheck) {
      setShouldCheckOnboarding(true);
    }
  }, [user, tenant?.id, authLoading, tenantLoading, shouldCheckOnboarding, skipOnboardingCheck]);
  
  // Check onboarding status when user and tenant are available
  const { data: onboardingComplete, isLoading: onboardingLoading } = useQuery({
    queryKey: ['onboarding-status', tenant?.id, user?.id],
    queryFn: async () => {
      if (!user || !tenant?.id) return false;
      
      try {
        // Check for company profile
        const { data: companyProfile } = await supabase
          .from('company_profiles')
          .select('id')
          .eq('tenant_id', tenant.id)
          .maybeSingle();

        // Check for persona profile
        const { data: personaProfile } = await supabase
          .from('persona_profiles')
          .select('id')
          .eq('tenant_id', tenant.id)
          .eq('user_id', user.id)
          .maybeSingle();
          
        const isComplete = !!companyProfile && !!personaProfile;
        onboardingCheckDoneRef.current = true;
        return isComplete;
      } catch (err) {
        console.error("Error checking onboarding status:", err);
        return false;
      }
    },
    enabled: shouldCheckOnboarding,
  });
  
  // Decide whether to show loading state
  const showLoading = authLoading || 
    tenantLoading || 
    (shouldCheckOnboarding && onboardingLoading);
  
  // If already redirected, don't process again
  if (redirectedRef.current) {
    return <>{children}</>;
  }

  // Don't redirect while checking auth status
  if (showLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={40} label="Loading..." />
      </div>
    );
  }
  
  // If not logged in, redirect to onboarding
  if (!user) {
    // Special case: already on auth pages
    if (location.pathname.startsWith("/auth/")) {
      return <>{children}</>;
    }
    
    redirectedRef.current = true;
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }
  
  // If logged in but no tenant selected, redirect to workspace selection
  if (!tenant) {
    // Special case: already on onboarding or workspace page
    if (location.pathname === "/onboarding" || location.pathname === "/workspace") {
      return <>{children}</>;
    }
    
    redirectedRef.current = true;
    return <Navigate to="/workspace" state={{ from: location.pathname }} replace />;
  }

  // If onboarding check completed and it's not complete and we're not already on the onboarding page,
  // redirect to onboarding
  if (shouldCheckOnboarding && 
      onboardingCheckDoneRef.current &&
      onboardingComplete === false && 
      !skipOnboardingCheck) {
    redirectedRef.current = true;
    return <Navigate to="/onboarding" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
