
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ShieldAlert, Shield } from "lucide-react";
import type { SecurityAuditIssue } from "../hooks/useSecurityAudit";

interface SecurityIssuesListProps {
  issues: SecurityAuditIssue[];
}

export function SecurityIssuesList({ issues }: SecurityIssuesListProps) {
  if (!issues || issues.length === 0) {
    return (
      <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
        <Shield className="h-4 w-4 text-green-500" />
        <AlertTitle>No security issues detected</AlertTitle>
        <AlertDescription>
          All tables appear to have proper security configurations
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      <Alert variant="destructive" className="mb-2">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Security issues detected</AlertTitle>
        <AlertDescription>
          {issues.length} potential security issues found that require attention
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        {issues.map((issue, index) => (
          <Alert 
            key={index} 
            variant={issue.type === 'rls_disabled' ? "destructive" : "default"}
            className="border-l-4 border-l-amber-500"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>
                <AlertTitle className="font-mono">{issue.name}</AlertTitle>
                <AlertDescription>
                  <p>{issue.detail}</p>
                  <p className="mt-1 text-sm font-medium">Recommendation: {issue.remediation}</p>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        ))}
      </div>
    </div>
  );
}
