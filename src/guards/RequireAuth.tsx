
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { Loader2 } from 'lucide-react';
import { MaintenanceMode } from '@/components/MaintenanceMode';
import { supabase } from '@/integrations/supabase/client';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const location = useLocation();

  // Check if the system is in maintenance mode
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const { data, error } = await supabase
          .from('system_config')
          .select('config')
          .eq('key', 'maintenance_mode')
          .single();

        if (!error && data && data.config) {
          const configData = typeof data.config === 'string'
            ? JSON.parse(data.config)
            : data.config;
          
          setIsMaintenanceMode(configData.enabled === true);
        }
      } catch (err) {
        console.error('Error checking maintenance mode:', err);
      }
    };

    checkMaintenance();
  }, []);

  // If authentication is still loading, show a loading spinner
  if (authLoading || tenantLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    // Redirect to login page but remember where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If system is in maintenance mode, show maintenance page
  if (isMaintenanceMode) {
    return <MaintenanceMode>{children}</MaintenanceMode>;
  }

  // User is authenticated and system is not in maintenance mode, render children
  return <>{children}</>;
};
