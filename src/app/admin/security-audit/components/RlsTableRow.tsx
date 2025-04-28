
import React from "react";
import type { RlsTable, RlsPolicy } from "../hooks/useRlsData";
import type { AccessTestResult } from "../hooks/useAccessTests";
import { DisabledRlsRow } from "./rows/DisabledRlsRow";
import { NoRlsPoliciesRow } from "./rows/NoRlsPoliciesRow";
import { PolicyRow } from "./rows/PolicyRow";
import { DebugErrorBoundary } from "@/components/DebugErrorBoundary";

export interface RlsTableRowProps {
  table: RlsTable;
  testResult?: AccessTestResult;
}

export function RlsTableRow({ 
  table, 
  testResult 
}: RlsTableRowProps) {
  if (!table.rlsEnabled) {
    return (
      <DebugErrorBoundary>
        <DisabledRlsRow tableName={table.tablename} />
      </DebugErrorBoundary>
    );
  }

  if (table.policies.length === 0) {
    return (
      <DebugErrorBoundary>
        <NoRlsPoliciesRow tableName={table.tablename} testResult={testResult} />
      </DebugErrorBoundary>
    );
  }

  return (
    <>
      {table.policies.map((policy, index) => (
        <DebugErrorBoundary key={`${table.tablename}-${policy.policyname}`}>
          <PolicyRow
            key={`${table.tablename}-${policy.policyname}`}
            policy={policy}
            tableName={table.tablename}
            isFirstPolicy={index === 0}
            totalPolicies={table.policies.length}
            testResult={index === 0 ? testResult : undefined}
          />
        </DebugErrorBoundary>
      ))}
    </>
  );
}
