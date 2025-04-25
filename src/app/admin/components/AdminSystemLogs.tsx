
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSystemLogsWithFilters } from "@/hooks/useSystemLogsWithFilters";
import { AdminSystemLogsTable } from "./AdminSystemLogsTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";

export function AdminSystemLogs() {
  const {
    logs,
    filters,
    updateFilters,
    resetFilters,
    isLoading,
    getRecentLogs,
    pagination,
    nextPage,
    prevPage,
    goToPage,
  } = useSystemLogsWithFilters();

  const { currentPage, totalPages } = pagination;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ search: e.target.value });
  };

  const handleDateRangeChange = (value: string) => {
    updateFilters({ dateRange: parseInt(value, 10) });
  };

  const handleEventTypeChange = (value: string) => {
    updateFilters({ eventType: value });
  };

  const handleRefresh = () => {
    getRecentLogs();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl font-bold">System Logs</CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Input
                placeholder="Search logs..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>
            <div>
              <Select value={filters.eventType} onValueChange={handleEventTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All events</SelectItem>
                  <SelectItem value="AUTH_LOGIN">Auth Login</SelectItem>
                  <SelectItem value="DATA_UPDATE">Data Update</SelectItem>
                  <SelectItem value="SECURITY_ACCESS_DENIED">Security Access Denied</SelectItem>
                  <SelectItem value="SYSTEM_UPDATE">System Update</SelectItem>
                  <SelectItem value="API_ERROR">API Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={filters.dateRange.toString()}
                onValueChange={handleDateRangeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last 24 hours</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <AdminSystemLogsTable
            logs={logs}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onNextPage={nextPage}
            onPrevPage={prevPage}
            onGoToPage={goToPage}
          />

          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
