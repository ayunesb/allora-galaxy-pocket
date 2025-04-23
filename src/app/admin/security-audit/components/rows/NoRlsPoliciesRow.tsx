
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";
import type { AccessTestResult } from "../../hooks/useAccessTests";
import { AccessTestBadge } from "../badges/AccessTestBadge";

interface NoRlsPoliciesRowProps {
  tableName: string;
  testResult?: AccessTestResult;
}

export function NoRlsPoliciesRow({ tableName, testResult }: NoRlsPoliciesRowProps) {
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
        {testResult && <AccessTestBadge testResult={testResult} />}
      </td>
    </tr>
  );
}
