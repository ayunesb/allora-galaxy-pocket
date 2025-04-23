
import { Badge } from "@/components/ui/badge";
import type { RlsPolicy } from "../hooks/useRlsData";
import type { AccessTestResult } from "../hooks/useAccessTests";
import { AlertCircle, CheckCircle, XCircle, ShieldAlert } from "lucide-react";

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

  const getPolicyStatusBadge = (policy: RlsPolicy) => {
    const hasAuthReference = checkPolicyAuthReference(policy);
    
    if (!hasAuthReference) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <ShieldAlert className="h-3 w-3" />
          Insecure
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Secured
      </Badge>
    );
  };

  const getTestResultBadge = (result: AccessTestResult) => {
    if (result.status === 'allowed') {
      return (
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Allowed ({result.rowCount} rows)
        </Badge>
      );
    } else if (result.status === 'blocked') {
      return (
        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Blocked
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Error: {result.errorMessage}
        </Badge>
      );
    }
  };

  if (!rlsEnabled) {
    return (
      <tr className="bg-gray-50">
        <td className="p-3 border">{tableName}</td>
        <td className="p-3 border text-center">
          <Badge variant="secondary" className="bg-gray-50 text-gray-500">
            Disabled
          </Badge>
        </td>
        <td className="p-3 border" colSpan={3}>No RLS protection</td>
        <td className="p-3 border text-center">N/A</td>
      </tr>
    );
  }

  if (policies.length === 0) {
    return (
      <tr className="bg-red-50">
        <td className="p-3 border">{tableName}</td>
        <td className="p-3 border text-center">
          <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
            Enabled
          </Badge>
        </td>
        <td className="p-3 border text-red-700" colSpan={3}>
          <div className="flex items-center gap-1">
            <ShieldAlert className="h-4 w-4" />
            <span className="font-semibold">CRITICAL: RLS enabled but no policies (denies all access)</span>
          </div>
        </td>
        <td className="p-3 border text-center">
          {testResult && getTestResultBadge(testResult)}
        </td>
      </tr>
    );
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
            {policyIndex === 0 ? (
              <td className="p-3 border" rowSpan={policies.length}>
                {tableName}
              </td>
            ) : null}
            
            {policyIndex === 0 ? (
              <td className="p-3 border text-center" rowSpan={policies.length}>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Enabled
                </Badge>
              </td>
            ) : null}
            
            <td className="p-3 border">{policy.policyname}</td>
            <td className="p-3 border">{policy.command}</td>
            <td className="p-3 border">
              {getPolicyStatusBadge(policy)}
            </td>
            
            {policyIndex === 0 ? (
              <td className="p-3 border text-center" rowSpan={policies.length}>
                {testResult ? (
                  getTestResultBadge(testResult)
                ) : (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                    Not Tested
                  </Badge>
                )}
              </td>
            ) : null}
          </tr>
        );
      })}
    </>
  );
}
