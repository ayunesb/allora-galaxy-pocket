
import { useEffect, useState } from 'react';
import { useSystemLogs } from './useSystemLogs';
import { SystemLog } from '@/types/agent';

// Helper hook for components that need access to system logs
export function useSystemLogsState() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { logActivity } = useSystemLogs();

  // Define fetchLogs function to load logs
  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Implementation for fetching logs would go here
      // For now, return empty array
      setLogs([]);
    } catch (err) {
      setError(err);
      console.error("Error fetching logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh function that re-fetches logs
  const refresh = () => {
    fetchLogs();
  };

  // Load logs on initial mount
  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    isLoading,
    error,
    fetchLogs,
    refresh,
    logActivity
  };
}
