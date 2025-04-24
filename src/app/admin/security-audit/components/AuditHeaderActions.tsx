
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShieldAlert, Download } from "lucide-react";

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
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-1"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh Audit
      </Button>
      <Button
        variant="default"
        onClick={onRunTests}
        disabled={isRunningTests || isLoading || !hasData}
        className="flex items-center gap-1"
      >
        <ShieldAlert className="h-4 w-4" />
        Run Access Tests
      </Button>
      <Button
        variant="outline"
        onClick={onExport}
        disabled={!hasData}
        className="flex items-center gap-1"
      >
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );
}
