
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface Props {
  status: Record<string, any>;
}

const SystemOverallAlert: React.FC<Props> = ({ status }) => {
  const hasAnyError = Object.values(status).some(
    (value) =>
      value === false ||
      (typeof value === "object" &&
        Object.values(value as Record<string, any>).some((v) => v === false))
  );

  return hasAnyError ? (
    <div className="w-full">
      <Alert variant="destructive">
        <AlertTitle>System issues detected</AlertTitle>
        <AlertDescription>
          Some components may not function correctly. Please fix the issues above before proceeding.
        </AlertDescription>
      </Alert>
    </div>
  ) : (
    <div className="w-full">
      <Alert variant="default" className="bg-green-50 border-green-200">
        <AlertTitle>All systems operational</AlertTitle>
        <AlertDescription>
          Your Allora OS environment is properly configured and ready for use.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SystemOverallAlert;
