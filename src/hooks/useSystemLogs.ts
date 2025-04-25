
import { useSystemLogsState } from './useSystemLogsState';
import { useLogActivity } from './useLogActivity';
import { SystemLog, LogSeverity } from '@/types/systemLog';

export function useSystemLogs() {
  const { logs, isLoading, error, getRecentLogs } = useSystemLogsState();
  const { 
    logActivity: logActivityBase, 
    logError: logErrorBase, 
    logSecurityEvent: logSecurityEventBase,
    isLogging 
  } = useLogActivity();

  // Enhanced logActivity with better error handling
  const logActivity = async (params: {
    event_type: string;
    message: string;
    meta?: Record<string, any>;
    severity?: LogSeverity;
  }) => {
    try {
      return await logActivityBase(params);
    } catch (error) {
      console.error("Failed to log activity:", error);
      return { success: false, error };
    }
  };

  // Enhanced logError
  const logError = async (
    message: string,
    error: Error | any,
    meta: Record<string, any> = {}
  ) => {
    try {
      return await logErrorBase(message, error, meta);
    } catch (logError) {
      console.error("Failed to log error:", logError);
      return { success: false, error: logError };
    }
  };

  // Enhanced logSecurityEvent
  const logSecurityEvent = async (
    message: string,
    eventType: string,
    meta: Record<string, any> = {}
  ) => {
    try {
      return await logSecurityEventBase(message, eventType, meta);
    } catch (error) {
      console.error("Failed to log security event:", error);
      return { success: false, error };
    }
  };

  // Add journey step tracking (used for tracking user flow through the essential journey)
  const logJourneyStep = async (
    from: string,
    to: string,
    details: Record<string, any> = {}
  ) => {
    try {
      return await logActivity({
        event_type: 'USER_JOURNEY',
        message: `User navigated from ${from} to ${to}`,
        meta: {
          from,
          to,
          ...details
        }
      });
    } catch (error) {
      console.error("Failed to log journey step:", error);
      return { success: false, error };
    }
  };

  return {
    // Log state
    logs,
    isLoading,
    error,
    getRecentLogs,
    
    // Log actions
    logActivity,
    logError,
    logSecurityEvent,
    logJourneyStep,
    isLogging
  };
}

export type { SystemLog };
