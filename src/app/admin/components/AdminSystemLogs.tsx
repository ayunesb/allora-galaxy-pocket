
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSystemLogsWithFilters } from "@/hooks/useSystemLogsWithFilters";
import { AdminSystemLogsTable } from "./AdminSystemLogsTable";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { AdminLogsFilterPanel } from "./AdminLogsFilterPanel";
import { LogFilters } from "@/types/logFilters";

export function AdminSystemLogs() {
  const {
    logs,
    filters,
    updateFilters,
    resetFilters,
    isLoading,
    fetchLogs,
    pagination,
    nextPage,
    prevPage,
    goToPage,
  } = useSystemLogsWithFilters();

  const handleRefresh = () => {
    fetchLogs();
  };

  // Creating a properly typed pagination object that includes logsPerPage
  const paginationWithLogsPerPage = {
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    logsPerPage: 20 // Default to 20 logs per page
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
          <AdminLogsFilterPanel 
            filters={filters as LogFilters} 
            onFilterChange={updateFilters} 
            onClearFilters={resetFilters}
            eventTypes={['all', 'ERROR', 'WARNING', 'INFO', 'AUTH', 'SECURITY', 'USER_JOURNEY']}
          />
          
          <div className="mt-6">
            <AdminSystemLogsTable
              logs={logs}
              isLoading={isLoading}
              pagination={paginationWithLogsPerPage}
              onNextPage={nextPage}
              onPrevPage={prevPage}
              onGoToPage={goToPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
