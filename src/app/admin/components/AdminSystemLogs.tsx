
import React, { useState } from 'react';
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
import { AdminSystemLogsTable } from './AdminSystemLogsTable';
import { LogSecurityAlert } from '@/app/admin/logs/LogSecurityAlert';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';

export function AdminSystemLogs() {
  const { 
    logs, 
    isLoading, 
    filters, 
    setFilters,
    getRecentLogs,
    pagination: {
      currentPage,
      totalPages,
      goToPage
    }
  } = useSystemLogsWithFilters();
  
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };

  const handleRefresh = () => {
    getRecentLogs(100);
  };

  const handleDateRangeChange = (value: string) => {
    setFilters({ dateRange: parseInt(value) });
  };

  const handleEventTypeChange = (value: string) => {
    setFilters({ eventType: value });
  };

  const toggleSecurityInfo = () => {
    setShowSecurityInfo(!showSecurityInfo);
  };

  // Log security monitoring access event
  React.useEffect(() => {
    if (user?.id && tenant?.id) {
      const logSecurityView = async () => {
        try {
          // Log access to security monitoring tools
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
          // Silent fail - don't disrupt user experience
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
          <Input
            placeholder="Search logs..."
            value={filters.search}
            onChange={handleSearch}
            className="w-full"
            startAdornment={<Search className="h-4 w-4 mr-2 text-muted-foreground" />}
          />
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
      
      <AdminSystemLogsTable 
        logs={logs} 
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
      />
    </div>
  );
}
