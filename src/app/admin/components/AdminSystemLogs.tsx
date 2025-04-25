
import React, { useState, useEffect } from "react";
import { useSystemLogsWithFilters } from '@/hooks/useSystemLogsWithFilters';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Search, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showToast } from '@/utils/toastUtils';
import { SystemLog } from '@/hooks/useSystemLogsWithFilters';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';

// Placeholder component for LogSecurityAlert
const LogSecurityAlert = () => (
  <div className="p-4 border rounded bg-yellow-50 mb-4">
    <h3 className="font-medium">Security Information</h3>
    <p className="text-sm">System logs may contain sensitive information. Access is being monitored.</p>
  </div>
);

// Placeholder component for SecurityLogViewer
const SecurityLogViewer = ({ 
  logs, 
  onLogSelect 
}: { 
  logs: SystemLog[],
  onLogSelect?: (log: SystemLog) => void 
}) => (
  <div className="border rounded overflow-hidden">
    <table className="w-full">
      <thead className="bg-muted">
        <tr>
          <th className="p-2 text-left">Timestamp</th>
          <th className="p-2 text-left">Severity</th>
          <th className="p-2 text-left">Message</th>
        </tr>
      </thead>
      <tbody>
        {logs.length === 0 ? (
          <tr>
            <td colSpan={3} className="p-4 text-center text-muted-foreground">
              No logs available
            </td>
          </tr>
        ) : (
          logs.map((log) => (
            <tr 
              key={log.id} 
              className="border-t hover:bg-muted/50 cursor-pointer"
              onClick={() => onLogSelect?.(log)}
            >
              <td className="p-2 text-sm">
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td className="p-2 text-sm">
                <span className={`px-2 py-1 rounded text-xs ${
                  log.severity === 'error' ? 'bg-red-100 text-red-800' : 
                  log.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {log.severity}
                </span>
              </td>
              <td className="p-2 text-sm">{log.message}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export function AdminSystemLogs() {
  const { 
    logs, 
    isLoading, 
    filters, 
    updateFilters,
    getRecentLogs,
    pagination
  } = useSystemLogsWithFilters();
  
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ search: e.target.value });
  };

  const handleRefresh = () => {
    getRecentLogs(100);
    showToast({
      title: "Logs refreshed",
      description: "The system logs have been updated.",
      variant: 'default'
    });
  };

  const handleDateRangeChange = (value: string) => {
    updateFilters({ dateRange: parseInt(value) });
  };

  const handleEventTypeChange = (value: string) => {
    updateFilters({ eventType: value });
  };

  const toggleSecurityInfo = () => {
    setShowSecurityInfo(!showSecurityInfo);
  };

  const handleLogSelect = (log: SystemLog) => {
    showToast({
      title: "Log details",
      description: log.message,
      variant: 'default'
    });
  };

  useEffect(() => {
    if (user?.id && tenant?.id) {
      const logSecurityView = async () => {
        try {
          await fetch('/api/log-security-access', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: user.id,
              tenant_id: tenant.id,
              feature: 'system_logs'
            })
          });
        } catch (error) {
          console.error('Failed to log security access:', error);
        }
      };
      
      logSecurityView();
    }
  }, [user?.id, tenant?.id]);

  return (
    <div className="space-y-4">
      {showSecurityInfo && <LogSecurityAlert />}
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={filters.search}
              onChange={handleSearch}
              className="w-full pl-8"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select 
            value={filters.dateRange.toString()} 
            onValueChange={handleDateRangeChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={filters.eventType} 
            onValueChange={handleEventTypeChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              <SelectItem value="auth">Authentication</SelectItem>
              <SelectItem value="data">Data changes</SelectItem>
              <SelectItem value="SECURITY">Security</SelectItem>
              <SelectItem value="api">API calls</SelectItem>
              <SelectItem value="error">Errors</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={toggleSecurityInfo} variant="outline" size="icon" title="Security information">
            <Shield className="h-4 w-4" />
          </Button>
          
          <Button onClick={handleRefresh} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <SecurityLogViewer 
        logs={logs} 
        onLogSelect={handleLogSelect}
      />
    </div>
  );
}
