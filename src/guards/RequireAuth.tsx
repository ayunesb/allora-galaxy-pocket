
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const location = useLocation();
  
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
    enabled: !!user && !!tenant?.id,
  });
  
  const isLoading = authLoading || tenantLoading || (!!user && !!tenant?.id && onboardingLoading);
  
  // Don't redirect while checking auth status
  if (isLoading) {
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

  // If onboarding is not complete and we're not already on the onboarding page,
  // redirect to onboarding
  if (onboardingComplete === false && !location.pathname.includes("/onboarding")) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
