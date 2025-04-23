
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Props {
  show: boolean;
  onCreateSystemConfig: () => void;
}

const SystemConfigAlert: React.FC<Props> = ({ show, onCreateSystemConfig }) =>
  !show ? null : (
    <Alert variant="destructive" className="mt-4">
      <AlertTitle>System configuration table missing</AlertTitle>
      <AlertDescription>
        The system_config table required for maintenance mode is missing.
        <Button
          onClick={onCreateSystemConfig}
          variant="outline"
          size="sm"
          className="mt-2"
        >
          Create Table
        </Button>
      </AlertDescription>
    </Alert>
  );

export default SystemConfigAlert;
