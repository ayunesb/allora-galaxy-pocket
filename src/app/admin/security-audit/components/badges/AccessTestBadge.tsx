
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import type { AccessTestResult } from "../../hooks/useAccessTests";

interface AccessTestBadgeProps {
  testResult: AccessTestResult;
}

export function AccessTestBadge({ testResult }: AccessTestBadgeProps) {
  if (testResult.status === 'allowed') {
    return (
      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Allowed ({testResult.rowCount} rows)
      </Badge>
    );
  }
  
  if (testResult.status === 'blocked') {
    return (
      <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Blocked
      </Badge>
    );
  }
  
  return (
    <Badge variant="destructive" className="flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      Error: {testResult.errorMessage}
    </Badge>
  );
}
