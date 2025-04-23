
import React from "react";
import { Badge } from "@/components/ui/badge";
import type { RlsPolicy } from "../../hooks/useRlsData";
import { PolicyStatusBadge } from "../badges/PolicyStatusBadge";

interface PolicyRowProps {
  policy: RlsPolicy;
  tableName: string;
  isFirstPolicy: boolean;
  totalPolicies: number;
  testResult?: { status: string; rowCount?: number; errorMessage?: string };
}

export function PolicyRow({ 
  policy, 
  tableName, 
  isFirstPolicy, 
  totalPolicies,
  testResult 
}: PolicyRowProps) {
  const checkPolicyAuthReference = (policy: RlsPolicy) => {
    const definition = policy.definition.toLowerCase();
    const hasAuthUid = definition.includes('auth.uid()');
    const hasTenantReference = 
      definition.includes('tenant_id') || 
      definition.includes('user_id');
    
    return hasAuthUid && hasTenantReference;
  };

  const hasAuthRef = checkPolicyAuthReference(policy);

  return (
    <tr className={!hasAuthRef ? "bg-red-50" : undefined}>
      {isFirstPolicy && (
        <td className="p-3 border" rowSpan={totalPolicies}>
          {tableName}
        </td>
      )}
      
      {isFirstPolicy && (
        <td className="p-3 border text-center" rowSpan={totalPolicies}>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
            Enabled
          </Badge>
        </td>
      )}
      
      <td className="p-3 border">{policy.policyname}</td>
      <td className="p-3 border">{policy.command}</td>
      <td className="p-3 border">
        <PolicyStatusBadge hasAuthReference={hasAuthRef} />
      </td>
      
      {isFirstPolicy && (
        <td className="p-3 border text-center" rowSpan={totalPolicies}>
          {testResult ? (
            <AccessTestBadge testResult={testResult} />
          ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-500">
              Not Tested
            </Badge>
          )}
        </td>
      )}
    </tr>
  );
}
