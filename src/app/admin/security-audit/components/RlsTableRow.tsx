
import React from "react";
import type { RlsPolicy } from "../hooks/useRlsData";
import type { AccessTestResult } from "../hooks/useAccessTests";
import { DisabledRlsRow } from "./rows/DisabledRlsRow";
import { NoRlsPoliciesRow } from "./rows/NoRlsPoliciesRow";
import { PolicyRow } from "./rows/PolicyRow";

interface RlsTableRowProps {
  tableName: string;
  rlsEnabled: boolean;
  policies: RlsPolicy[];
  testResult?: AccessTestResult;
}

export function RlsTableRow({ 
  tableName, 
  rlsEnabled, 
  policies, 
  testResult 
}: RlsTableRowProps) {
  if (!rlsEnabled) {
    return <DisabledRlsRow tableName={tableName} />;
  }

  if (policies.length === 0) {
    return <NoRlsPoliciesRow tableName={tableName} testResult={testResult} />;
  }

  return (
    <>
      {policies.map((policy, index) => (
        <PolicyRow
          key={`${tableName}-${policy.policyname}`}
          policy={policy}
          tableName={tableName}
          isFirstPolicy={index === 0}
          totalPolicies={policies.length}
          testResult={testResult}
        />
      ))}
    </>
  );
}
