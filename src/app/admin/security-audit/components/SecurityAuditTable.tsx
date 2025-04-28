
import React from "react";
import type { RlsTable } from "../hooks/useRlsData";
import type { AccessTestResult } from "../hooks/useAccessTests";
import { NoRlsPoliciesRow } from "./rows/NoRlsPoliciesRow";
import { PolicyRow } from "./rows/PolicyRow";
import { Skeleton } from "@/components/ui/skeleton";

interface SecurityAuditTableProps {
  tables: RlsTable[];
  testResults: AccessTestResult[];
  isLoading: boolean;
}

export function SecurityAuditTable({ tables, testResults, isLoading }: SecurityAuditTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <Skeleton className="h-8 w-64 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-muted">
          <th className="p-3 text-left font-medium border">Table</th>
          <th className="p-3 text-left font-medium border">RLS</th>
          <th className="p-3 text-left font-medium border">Policies</th>
          <th className="p-3 text-left font-medium border">Commands</th>
          <th className="p-3 text-left font-medium border">Auth Reference</th>
          <th className="p-3 text-left font-medium border">Test Result</th>
        </tr>
      </thead>
      <tbody>
        {tables.map((table) => {
          const testResult = testResults.find(r => r.tableName === table.tablename);
          
          if (!table.rlsEnabled) {
            return (
              <tr key={table.tablename} className="bg-red-50">
                <td className="p-3 border">{table.tablename}</td>
                <td className="p-3 border text-center">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                    Disabled
                  </span>
                </td>
                <td className="p-3 border" colSpan={4}>
                  <div className="text-red-700 font-medium">
                    RLS is not enabled for this table. Table is publicly accessible!
                  </div>
                </td>
              </tr>
            );
          }
          
          // Table has RLS enabled but no policies
          if (table.policies.length === 0) {
            return <NoRlsPoliciesRow 
              key={table.tablename} 
              tableName={table.tablename} 
              testResult={testResult}
            />;
          }
          
          // Table has RLS and policies
          return table.policies.map((policy, policyIndex) => (
            <PolicyRow 
              key={`${table.tablename}-${policy.policyname}`}
              policy={policy}
              tableName={table.tablename}
              isFirstPolicy={policyIndex === 0}
              totalPolicies={table.policies.length}
              testResult={policyIndex === 0 ? testResult : undefined}
            />
          ));
        })}
      </tbody>
    </table>
  );
}
