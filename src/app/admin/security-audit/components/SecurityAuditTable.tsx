
import React from "react";
import type { RlsTable } from "../hooks/useRlsData";
import type { AccessTestResult } from "../hooks/useAccessTests";
import { RlsTableRow } from "./RlsTableRow";

interface SecurityAuditTableProps {
  tables: RlsTable[];
  testResults: AccessTestResult[];
  isLoading: boolean;
}

export function SecurityAuditTable({ tables, testResults, isLoading }: SecurityAuditTableProps) {
  if (isLoading) {
    return <div className="text-center p-8">Loading security information...</div>;
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-muted">
          <th className="p-3 border text-left">Table</th>
          <th className="p-3 border text-center">RLS Status</th>
          <th className="p-3 border text-left">Policy Name</th>
          <th className="p-3 border text-left">Command</th>
          <th className="p-3 border text-center">Auth Reference</th>
          <th className="p-3 border text-center">Access Test</th>
        </tr>
      </thead>
      <tbody>
        {tables.length === 0 ? (
          <tr>
            <td colSpan={6} className="p-3 text-center text-muted-foreground">
              No tables found
            </td>
          </tr>
        ) : (
          tables.map((table) => (
            <RlsTableRow 
              key={table.tablename}
              table={table}
              testResult={testResults.find(r => r.tableName === table.tablename)}
            />
          ))
        )}
      </tbody>
    </table>
  );
}
