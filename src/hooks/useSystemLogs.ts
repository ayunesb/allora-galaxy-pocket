
import { useSystemLogsState } from './useSystemLogsState';
import { useLogActivity } from './useLogActivity';
import { SystemLog } from '@/types/systemLog';

export function useSystemLogs() {
  const { logs, isLoading, error, getRecentLogs } = useSystemLogsState();
  const { logActivity, logError, logSecurityEvent, logJourneyStep, isLogging } = useLogActivity();

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
