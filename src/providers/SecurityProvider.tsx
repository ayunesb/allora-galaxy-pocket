
import React, { ReactNode } from 'react';
import { useRouteMonitoring } from '@/hooks/useRouteMonitoring';
import { useTenantDataProtection } from '@/hooks/useTenantDataProtection';

interface SecurityProviderProps {
  children: ReactNode;
}

/**
 * SecurityProvider ensures that security features are enabled app-wide
 * It doesn't render any UI but adds important security hooks to the app
 */
export function SecurityProvider({ children }: SecurityProviderProps) {
  // Enable route monitoring for audit logs
  useRouteMonitoring();
  
  // Enable tenant data protection to prevent unauthorized cross-tenant access
  useTenantDataProtection();

  return <>{children}</>;
}
