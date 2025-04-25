
import { useState } from 'react';
import { SystemLog } from '@/types/systemLog';

// Mock data for development
const MOCK_LOGS: SystemLog[] = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    tenant_id: 'tenant-001',
    event_type: 'AUTH_LOGIN',
    message: 'User logged in successfully',
    severity: 'info',
    service: 'auth',
    timestamp: new Date().toISOString(),
    status: 'success'
  },
  {
    id: '2',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    tenant_id: 'tenant-001',
    event_type: 'DATA_UPDATE',
    message: 'Campaign data updated',
    severity: 'info',
    service: 'data',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: 'success'
  },
  {
    id: '3',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    tenant_id: 'tenant-001',
    event_type: 'SECURITY_ACCESS_DENIED',
    message: 'Unauthorized access attempt to admin panel',
    severity: 'error',
    service: 'security',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: 'error'
  },
  {
    id: '4',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    tenant_id: 'tenant-001',
    event_type: 'SYSTEM_UPDATE',
    message: 'System maintenance completed',
    severity: 'info',
    service: 'system',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: 'success'
  },
  {
    id: '5',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    tenant_id: 'tenant-001',
    event_type: 'API_ERROR',
    message: 'External API connection failed',
    severity: 'warning',
    service: 'api',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    status: 'warning'
  }
];

export function useSystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>(MOCK_LOGS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const getRecentLogs = async (limit = 50) => {
    setIsLoading(true);
    try {
      console.log(`Fetching ${limit} recent logs`);
      // This would normally fetch from an API
      // For now, we'll just simulate a delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      setLogs(MOCK_LOGS.slice(0, Math.min(limit, MOCK_LOGS.length)));
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const logActivity = async ({ 
    event_type, 
    message, 
    meta = {} 
  }: { 
    event_type: string;
    message: string;
    meta?: Record<string, any>;
  }) => {
    try {
      console.log(`Logging activity: ${event_type}`, message, meta);
      // You would typically call an API endpoint to log this activity
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };
  
  return {
    logs,
    isLoading,
    getRecentLogs,
    logActivity
  };
}
