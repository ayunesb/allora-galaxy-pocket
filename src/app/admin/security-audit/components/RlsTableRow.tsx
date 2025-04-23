
import { Badge } from "@/components/ui/badge";
import type { RlsPolicy } from "../hooks/useRlsData";
import type { AccessTestResult } from "../hooks/useAccessTests";
import { PolicyStatusBadge } from "./badges/PolicyStatusBadge";
import { AccessTestBadge } from "./badges/AccessTestBadge";
import { DisabledRlsRow } from "./rows/DisabledRlsRow";
import { NoRlsPoliciesRow } from "./rows/NoRlsPoliciesRow";

interface RlsTableRowProps {
  tableName: string;
  rlsEnabled: boolean;
  policies: RlsPolicy[];
  testResult?: AccessTestResult;
}

export function RlsTableRow({ tableName, rlsEnabled, policies, testResult }: RlsTableRowProps) {
  const checkPolicyAuthReference = (policy: RlsPolicy) => {
    const definition = policy.definition.toLowerCase();
    const hasAuthUid = definition.includes('auth.uid()');
    const hasTenantReference = 
      definition.includes('tenant_id') || 
      definition.includes('user_id');
    
    return hasAuthUid && hasTenantReference;
  };

  if (!rlsEnabled) {
    return <DisabledRlsRow tableName={tableName} />;
  }

  if (policies.length === 0) {
    return <NoRlsPoliciesRow tableName={tableName} testResult={testResult} />;
  }

  return (
    <>
      {policies.map((policy, policyIndex) => {
        const hasAuthRef = checkPolicyAuthReference(policy);
        
        return (
          <tr 
            key={`${tableName}-${policy.policyname}`}
            className={!hasAuthRef ? "bg-red-50" : (policyIndex % 2 === 0 ? "bg-white" : "bg-gray-50")}
          >
            {policyIndex === 0 && (
              <td className="p-3 border" rowSpan={policies.length}>
                {tableName}
              </td>
            )}
            
            {policyIndex === 0 && (
              <td className="p-3 border text-center" rowSpan={policies.length}>
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
            
            {policyIndex === 0 && (
              <td className="p-3 border text-center" rowSpan={policies.length}>
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
      })}
    </>
  );
}
