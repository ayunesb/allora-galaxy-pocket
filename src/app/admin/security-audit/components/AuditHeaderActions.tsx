
import React from "react";
import { Button } from "@/components/ui/button";
import { DownloadCloud, RefreshCw, Play, Shield } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AuditHeaderActionsProps {
  onRefresh: () => void;
  onRunTests: () => void;
  onExport: () => void;
  isLoading: boolean;
  isRunningTests: boolean;
  hasData: boolean;
}

export function AuditHeaderActions({
  onRefresh,
  onRunTests,
  onExport,
  isLoading,
  isRunningTests,
  hasData
}: AuditHeaderActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Refresh RLS data from database</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="default"
            size="sm"
            onClick={onRunTests}
            disabled={isRunningTests || isLoading || !hasData}
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunningTests ? 'Testing...' : 'Run Access Tests'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Test actual database access with current user</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            onClick={onExport}
            disabled={!hasData}
          >
            <DownloadCloud className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Download as CSV</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
