
import React from "react";
import { SecurityAuditIssue } from "../hooks/useSecurityAudit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Code } from "@/components/ui/code";
import { AlertTriangle, ShieldAlert, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SecurityIssuesListProps {
  issues: SecurityAuditIssue[];
}

export function SecurityIssuesList({ issues }: SecurityIssuesListProps) {
  if (!issues || issues.length === 0) return null;

  return (
    <div className="space-y-4 mb-6">
      <h3 className="text-lg font-medium">Security Issues ({issues.length})</h3>
      
      {issues.map((issue, index) => {
        const icon = issue.type === 'security_definer_view' 
          ? <Database className="h-4 w-4" /> 
          : <ShieldAlert className="h-4 w-4" />;
          
        const title = issue.type === 'security_definer_view'
          ? `Security Definer View: ${issue.name}`
          : issue.type === 'rls_disabled'
            ? `Missing RLS: ${issue.name}`
            : `Incomplete RLS Policy: ${issue.name}`;
        
        return (
          <Alert key={index} variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2">
              {title}
              <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
                {issue.type.replace(/_/g, ' ')}
              </Badge>
            </AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-2">{issue.detail}</p>
              <div className="mt-2">
                <strong>Recommended fix:</strong>
                <Code className="mt-1 text-xs">{issue.remediation}</Code>
              </div>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
