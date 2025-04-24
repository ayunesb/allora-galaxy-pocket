
import React from "react";
import { Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {tables.map((table) => {
          const testResult = testResults.find(r => r.tableName === table.tablename);
          
          return (
            <Card key={table.tablename}>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{table.tablename}</h3>
                    <PolicyStatusBadge status={table.has_rls ? "enabled" : "disabled"} />
                  </div>
                  <AccessTestBadge result={testResult?.status || "pending"} />
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Policy:</span>
                    <div>{table.policy_name || "No policy"}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Command:</span>
                    <div>{table.command}</div>
                  </div>
                </div>
                
                <div className="text-sm">
                  <span className="text-muted-foreground">Auth Reference:</span>
                  <div className="font-mono text-xs bg-muted p-1 rounded mt-1">
                    {table.auth_reference || "None"}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
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
    </div>
  );
}
