
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table } from "@/components/ui/table";
import { Check } from "lucide-react";
import type { SecurityAuditIssue } from "../hooks/useSecurityAudit";

interface SecurityIssuesListProps {
  issues: SecurityAuditIssue[];
}

export function SecurityIssuesList({ issues }: SecurityIssuesListProps) {
  if (issues.length === 0) {
    return (
      <Alert className="mb-4 bg-green-50 border-green-200">
        <Check className="h-4 w-4 text-green-600" />
        <AlertTitle>No security issues found</AlertTitle>
        <AlertDescription>
          All views are created without SECURITY DEFINER and all tables have RLS enabled.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Security Issues ({issues.length})</h3>
      <Table>
        <thead>
          <tr className="bg-muted">
            <th className="p-3 border">Type</th>
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Detail</th>
            <th className="p-3 border">Remediation</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue, index) => (
            <tr key={index} className="border-b">
              <td className="p-3 border">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {issue.type === 'security_definer_view' ? 'Security Definer View' : 
                   issue.type === 'rls_disabled' ? 'RLS Disabled' : 'Incomplete RLS'}
                </span>
              </td>
              <td className="p-3 border font-mono text-sm">{issue.name}</td>
              <td className="p-3 border">{issue.detail}</td>
              <td className="p-3 border text-sm">{issue.remediation}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
