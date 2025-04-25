
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSystemLogsWithFilters } from "@/hooks/useSystemLogsWithFilters";
import { AdminSystemLogsTable } from "./AdminSystemLogsTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { AdminLogsFilterPanel } from "./AdminLogsFilterPanel";

export function AdminSystemLogs() {
  const {
    logs,
    allLogs,
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ searchTerm: e.target.value });
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
          <AdminLogsFilterPanel filters={filters} onFilterChange={updateFilters} />
          
          <div className="mt-6">
            <AdminSystemLogsTable
              logs={logs}
              isLoading={isLoading}
              pagination={pagination}
              onNextPage={nextPage}
              onPrevPage={prevPage}
              onGoToPage={goToPage}
            />
          </div>

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
