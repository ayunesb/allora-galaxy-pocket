
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '@/hooks/useTenant';
import { Loader2 } from 'lucide-react';
import { MaintenanceMode } from '@/components/MaintenanceMode';
import { supabase } from '@/integrations/supabase/client';

const LoadingScreen = () => (
  <div className="flex h-screen w-screen items-center justify-center">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading your workspace...</p>
    </div>
  </div>
);

interface RequireAuthProps {
  children: React.ReactNode;
  allowDemo?: boolean;
}

export function RequireAuth({ children, allowDemo = false }: RequireAuthProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const navigate = useNavigate();
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isCheckingMaintenance, setIsCheckingMaintenance] = useState(true);

  // Handle authentication
  useEffect(() => {
    // Don't navigate away while still loading
    if (authLoading) return;

    // If no user, navigate to login screen 
    if (!user) {
      const path = window.location.pathname;
      navigate(`/auth/login?redirect=${encodeURIComponent(path)}`);
    }
  }, [authLoading, user, navigate]);

  // Check for maintenance mode
  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const { data } = await supabase
          .from('system_config')
          .select('config')
          .eq('key', 'maintenance_mode')
          .maybeSingle();

        if (data?.config && typeof data.config === 'object') {
          const configObj = data.config as Record<string, any>;
          setIsMaintenanceMode(configObj.enabled === true);
        } else {
          setIsMaintenanceMode(false);
        }
      } catch (error) {
        console.error('Failed to check maintenance mode:', error);
        setIsMaintenanceMode(false);
      } finally {
        setIsCheckingMaintenance(false);
      }
    };

    checkMaintenanceMode();
  }, []);

  // Check for system alerts
  useEffect(() => {
    const checkSystemAlerts = async () => {
      if (!user?.id) return;

      try {
        // Check for unresolved system alerts
        const { data } = await supabase
          .from('system_alerts')
          .select('*')
          .is('resolved_at', null)
          .eq('status', 'active')
          .limit(1);

        if (data && data.length > 0) {
          console.warn('Active system alert:', data[0].message);
        }
      } catch (error) {
        console.error('Failed to check system alerts:', error);
      }
    };

    checkSystemAlerts();
  }, [user?.id]);

  // Handle demo access
  useEffect(() => {
    if (authLoading || tenantLoading) return;

    // If we have a user and tenant but it's a demo
    if (user && tenant?.is_demo && !allowDemo) {
      navigate('/demo/restricted');
    }

    // Handle tenant missing case - only after auth is confirmed
    if (user && !tenantLoading && !tenant && !window.location.pathname.includes('/onboarding')) {
      navigate('/onboarding');
    }
  }, [user, tenant, tenantLoading, authLoading, allowDemo, navigate]);

  // Loading states
  if (authLoading || tenantLoading || isCheckingMaintenance) {
    return <LoadingScreen />;
  }

  // Maintenance mode
  if (isMaintenanceMode) {
    return <MaintenanceMode>{children}</MaintenanceMode>;
  }

  // Show children only when authenticated and with a valid tenant
  return <>{children}</>;
}

export default RequireAuth;
