
import React from "react";
import type { RlsTable } from "../../hooks/useRlsData";
import type { AccessTestResult } from "../../hooks/useAccessTests";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface RlsTableRowProps {
  table: RlsTable;
  testResult?: AccessTestResult;
}

export function RlsTableRow({ table, testResult }: RlsTableRowProps) {
  return (
    <tr>
      <td className="p-3 border font-mono text-sm">{table.tablename}</td>
      <td className="p-3 border">
        <Badge variant={table.rlsEnabled ? "outline" : "destructive"}>
          {table.rlsEnabled ? "Enabled" : "Disabled"}
        </Badge>
      </td>
      <td className="p-3 border">
        {table.policies.map((policy, index) => (
          <div key={index} className="mb-1">
            <Badge variant="secondary" className="mr-2">
              {policy.policyname}
            </Badge>
          </div>
        ))}
      </td>
      <td className="p-3 border">
        {table.policies.map((policy, index) => (
          <div key={index} className="mb-1">
            <Badge variant="outline">
              {policy.command}
            </Badge>
          </div>
        ))}
      </td>
      <td className="p-3 border">
        {table.policies.map((policy, index) => (
          <div key={index} className="mb-1">
            {policy.definition.toLowerCase().includes('auth.uid()') ? (
              <Badge className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Yes
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                No
              </Badge>
            )}
          </div>
        ))}
      </td>
      <td className="p-3 border">
        {testResult ? (
          testResult.status === 'allowed' ? (
            <Badge className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              {testResult.rowCount} rows
            </Badge>
          ) : testResult.status === 'blocked' ? (
            <Badge className="bg-amber-50 text-amber-700 border-amber-200">
              <XCircle className="h-3 w-3 mr-1" />
              Blocked
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              {testResult.errorMessage}
            </Badge>
          )
        ) : (
          <Badge variant="outline">Not tested</Badge>
        )}
      </td>
    </tr>
  );
}
