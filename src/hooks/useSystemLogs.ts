
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';

type LogActivity = {
  event_type: string;
  message: string;
  meta?: Record<string, any>;
};

/**
 * Hook for logging system activities, security events, and errors
 * Follows the three-phase approach with verification capabilities
 */
export function useSystemLogs() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [isLogging, setIsLogging] = useState(false);

  /**
   * Log general activity in the system
   */
  const logActivity = async (log: LogActivity) => {
    if (!user?.id) return false;
    
    setIsLogging(true);
    try {
      const { error } = await supabase.from('system_logs').insert({
        event_type: log.event_type,
        message: log.message,
        meta: log.meta || {},
        user_id: user.id,
        tenant_id: tenant?.id
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error logging activity:', error);
      return false;
    } finally {
      setIsLogging(false);
    }
  };

  /**
   * Log security-related events for audit purposes
   */
  const logSecurityEvent = async (message: string, eventType: string, meta?: Record<string, any>) => {
    if (!user?.id) return false;
    
    setIsLogging(true);
    try {
      const { error } = await supabase.from('system_logs').insert({
        event_type: `SECURITY_${eventType}`,
        message,
        meta: meta || {},
        user_id: user.id,
        tenant_id: tenant?.id
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error logging security event:', error);
      return false;
    } finally {
      setIsLogging(false);
    }
  };

  /**
   * Verify system modules are implementing all three phases
   * Returns detection of proper implementation
   */
  const verifyModuleImplementation = async (modulePath: string) => {
    if (!user?.id || !tenant?.id) return { verified: false, reason: 'Missing user or tenant' };
    
    try {
      // Log verification attempt for auditing
      await logActivity({
        event_type: 'MODULE_VERIFICATION',
        message: `Verifying implementation of three-phase approach in ${modulePath}`,
        meta: {
          module: modulePath,
          verifier_id: user.id,
          tenant_id: tenant.id
        }
      });

      // Phase 1: Check for error handling
      const hasErrorHandling = await verifyErrorHandling(modulePath);
      
      // Phase 2: Check for edge case handling
      const hasEdgeCaseHandling = await verifyEdgeCaseHandling(modulePath);
      
      // Phase 3: Check for role-based testing
      const hasRoleBasedTesting = await verifyRoleBasedTesting(modulePath);
      
      const result = {
        verified: hasErrorHandling && hasEdgeCaseHandling && hasRoleBasedTesting,
        phase1Complete: hasErrorHandling,
        phase2Complete: hasEdgeCaseHandling,
        phase3Complete: hasRoleBasedTesting,
        modulePath
      };
      
      // Log the verification result
      await logActivity({
        event_type: 'VERIFICATION_RESULT',
        message: `Module ${modulePath} verification ${result.verified ? 'passed' : 'failed'}`,
        meta: result
      });
      
      return result;
    } catch (error) {
      console.error('Error verifying module implementation:', error);
      return { verified: false, reason: 'Verification error' };
    }
  };

  /**
   * Helper: Verify if module has proper error handling
   */
  const verifyErrorHandling = async (modulePath: string) => {
    try {
      // For demonstration, we'll check system logs for error handling events
      const { data } = await supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenant?.id)
        .like('event_type', '%ERROR%')
        .like('meta->module', `%${modulePath}%`)
        .order('created_at', { ascending: false })
        .limit(1);
      
      return !!data?.length;
    } catch (error) {
      console.error('Error verifying error handling:', error);
      return false;
    }
  };

  /**
   * Helper: Verify if module handles edge cases
   */
  const verifyEdgeCaseHandling = async (modulePath: string) => {
    try {
      // For demonstration purposes
      const { data } = await supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenant?.id)
        .like('event_type', '%EDGE_CASE%')
        .like('meta->module', `%${modulePath}%`)
        .order('created_at', { ascending: false })
        .limit(1);
      
      return !!data?.length;
    } catch (error) {
      console.error('Error verifying edge case handling:', error);
      return false;
    }
  };

  /**
   * Helper: Verify if module has role-based testing
   */
  const verifyRoleBasedTesting = async (modulePath: string) => {
    try {
      // For demonstration purposes
      const { data } = await supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenant?.id)
        .like('event_type', '%ROLE_TEST%')
        .like('meta->module', `%${modulePath}%`)
        .order('created_at', { ascending: false })
        .limit(1);
      
      return !!data?.length;
    } catch (error) {
      console.error('Error verifying role-based testing:', error);
      return false;
    }
  };

  return {
    logActivity,
    logSecurityEvent,
    verifyModuleImplementation,
    isLogging
  };
}
