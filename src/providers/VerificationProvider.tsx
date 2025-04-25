
import React, { ReactNode, useEffect, useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { toast } from '@/components/ui/sonner';

interface VerificationProviderProps {
  children: ReactNode;
}

/**
 * Provider component that verifies all modules follow the three-phase approach:
 * Phase 1: Fix all errors and implement missing functionality
 * Phase 2: Add proper error handling and edge cases
 * Phase 3: Test thoroughly with different user roles and scenarios
 */
export function VerificationProvider({ children }: VerificationProviderProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const { verifyModuleImplementation } = useSystemLogs();
  const [verificationComplete, setVerificationComplete] = useState(false);
  
  // Core modules to verify
  const coreModules = [
    'auth',
    'tenant',
    'workspace',
    'admin',
    'security',
    'plugins',
    'billing'
  ];
  
  useEffect(() => {
    // Skip verification during loading or if already completed
    if (authLoading || tenantLoading || !user || !tenant || verificationComplete) return;

    const runVerification = async () => {
      console.log('Running verification of three-phase approach across modules...');
      
      let allModulesVerified = true;
      const incompleteModules: string[] = [];
      
      for (const module of coreModules) {
        const result = await verifyModuleImplementation(module);
        
        if (!result.verified) {
          allModulesVerified = false;
          incompleteModules.push(module);
          
          console.warn(`Module ${module} verification failed:`, result);
        }
      }
      
      if (!allModulesVerified && user.email?.includes('admin')) {
        // Only notify admins about incomplete modules
        toast.warning('Incomplete module verification', {
          description: `The following modules need review: ${incompleteModules.join(', ')}`,
          duration: 5000,
        });
      }
      
      setVerificationComplete(true);
    };
    
    // Delay verification to avoid initial loading issues
    const timeoutId = setTimeout(runVerification, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [authLoading, tenantLoading, user, tenant, verifyModuleImplementation, verificationComplete]);

  // Just render children - verification happens in background
  return <>{children}</>;
}
