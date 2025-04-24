
import React from "react";
import { Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PolicyStatusBadge } from "./badges/PolicyStatusBadge";
import { AccessTestBadge } from "./badges/AccessTestBadge";
import type { RlsTable } from "../hooks/useRlsData";
import type { AccessTestResult } from "../hooks/useAccessTests";
import { RlsTableRow } from "./rows/RlsTableRow";

interface SecurityAuditTableProps {
  tables: RlsTable[];
  testResults: AccessTestResult[];
  isLoading: boolean;
}

export function SecurityAuditTable({ tables, testResults, isLoading }: SecurityAuditTableProps) {
  if (isLoading) {
    return (
      <Table>
        <thead>
          <tr className="bg-muted">
            <th className="p-3 border">Table</th>
            <th className="p-3 border">RLS Status</th>
            <th className="p-3 border">Policy Name</th>
            <th className="p-3 border">Command</th>
            <th className="p-3 border">Auth Reference</th>
            <th className="p-3 border">Access Test Result</th>
          </tr>
        </thead>
        <tbody>
          {Array(5).fill(0).map((_, index) => (
            <tr key={index}>
              <td colSpan={6} className="p-2">
                <Skeleton className="h-8 w-full" />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  return (
    <Table>
      <thead>
        <tr className="bg-muted">
          <th className="p-3 border">Table</th>
          <th className="p-3 border">RLS Status</th>
          <th className="p-3 border">Policy Name</th>
          <th className="p-3 border">Command</th>
          <th className="p-3 border">Auth Reference</th>
          <th className="p-3 border">Access Test Result</th>
        </tr>
      </thead>
      <tbody>
        {tables.map((table) => (
          <RlsTableRow 
            key={table.tablename}
            table={table}
            testResult={testResults.find(r => r.tableName === table.tablename)}
          />
        ))}
      </tbody>
    </Table>
  );
}
