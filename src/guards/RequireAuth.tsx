
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const location = useLocation();
  const [shouldCheckOnboarding, setShouldCheckOnboarding] = useState(false);
  
  // Only enable onboarding check when both user and tenant are loaded
  useEffect(() => {
    if (user && tenant?.id && !authLoading && !tenantLoading) {
      setShouldCheckOnboarding(true);
    }
  }, [user, tenant?.id, authLoading, tenantLoading]);
  
  // Check onboarding status when user and tenant are available
  const { data: onboardingComplete, isLoading: onboardingLoading } = useQuery({
    queryKey: ['onboarding-status', tenant?.id, user?.id],
    queryFn: async () => {
      if (!user || !tenant?.id) return false;
      
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
        
      return !!companyProfile && !!personaProfile;
    },
    enabled: shouldCheckOnboarding,
  });
  
  // Don't redirect while checking auth status
  if (authLoading || tenantLoading || (shouldCheckOnboarding && onboardingLoading)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={40} label="Loading..." />
      </div>
    );
  }
  
  // If not logged in, redirect to onboarding
  if (!user) {
    // Using string literal to prevent possible recursion due to object references
    return <Navigate to="/onboarding" state={{ from: location.pathname }} replace />;
  }
  
  // If logged in but no tenant selected, redirect to workspace selection
  if (!tenant) {
    // Using string literal to prevent possible recursion due to object references
    return <Navigate to="/workspace" state={{ from: location.pathname }} replace />;
  }

  // If onboarding check completed and it's not complete and we're not already on the onboarding page,
  // redirect to onboarding
  if (shouldCheckOnboarding && 
      onboardingComplete === false && 
      !location.pathname.includes("/onboarding")) {
    // Using string literal to prevent possible recursion
    return <Navigate to="/onboarding" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
