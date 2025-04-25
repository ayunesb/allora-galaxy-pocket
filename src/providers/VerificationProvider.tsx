
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';

interface VerificationContextType {
  isVerifying: boolean;
  verifyModule: (modulePath: string) => Promise<any>;
  verificationResults: Record<string, any>;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export function VerificationProvider({ children }: { children: ReactNode }) {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResults, setVerificationResults] = useState<Record<string, any>>({});
  const { verifyModuleImplementation } = useSystemLogs();
  const { user } = useAuth();
  const { tenant } = useTenant();

  const verifyModule = async (modulePath: string): Promise<any> => {
    if (!user || !tenant) {
      return { verified: false, reason: 'No active user or tenant' };
    }

    setIsVerifying(true);
    try {
      const result = await verifyModuleImplementation(modulePath);
      
      // Store result in state
      setVerificationResults(prev => ({
        ...prev,
        [modulePath]: result
      }));
      
      return result;
    } catch (error) {
      console.error(`Error verifying module ${modulePath}:`, error);
      return { 
        verified: false, 
        error: true 
      };
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <VerificationContext.Provider value={{
      isVerifying,
      verifyModule,
      verificationResults
    }}>
      {children}
    </VerificationContext.Provider>
  );
}

export const useVerification = (): VerificationContextType => {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
};
