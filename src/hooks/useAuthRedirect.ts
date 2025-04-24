
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useTenant } from './useTenant';

export function useAuthRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { tenant } = useTenant();

  useEffect(() => {
    // Get intended destination from state or default to dashboard
    const destination = location.state?.from || '/dashboard';

    // If authenticated and has tenant, redirect to intended destination
    if (user && tenant) {
      // Don't redirect if already on auth pages
      if (!location.pathname.startsWith('/auth/')) {
        navigate(destination, { replace: true });
      }
    }
  }, [user, tenant, navigate, location]);

  return null;
}
