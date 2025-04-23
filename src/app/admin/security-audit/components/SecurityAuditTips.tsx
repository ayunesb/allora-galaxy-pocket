
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, CheckCircle } from "lucide-react";

export function SecurityAuditTips() {
  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-xl font-semibold">Security Audit Tips</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Critical Issues</AlertTitle>
          <AlertDescription className="text-sm space-y-1">
            <p>• Tables with RLS enabled but no policies (denies all access)</p>
            <p>• Policies with no auth.uid() reference (potential data leakage)</p>
            <p>• Policies with no tenant isolation (cross-tenant data access)</p>
          </AlertDescription>
        </Alert>
        
        <Alert variant="default">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Best Practices</AlertTitle>
          <AlertDescription className="text-sm space-y-1">
            <p>• All tables should have RLS enabled</p>
            <p>• Each policy should reference auth.uid()</p>
            <p>• Each policy should reference tenant_id for isolation</p>
            <p>• Default service role policies should exist for system operations</p>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
