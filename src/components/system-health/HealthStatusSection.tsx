
import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  database: boolean;
  auth: boolean;
  edgeFunctions: boolean;
  maintenance: null | boolean;
}

const HealthStatusSection: React.FC<Props> = ({
  database,
  auth,
  edgeFunctions,
  maintenance,
}) => (
  <div className="grid gap-3">
    <div className="flex items-center justify-between">
      <span>Database Connection</span>
      {database ? (
        <Badge variant="success" className="bg-green-500">
          <CheckCircle className="h-4 w-4 mr-1" /> Connected
        </Badge>
      ) : (
        <Badge variant="destructive">
          <AlertCircle className="h-4 w-4 mr-1" /> Failed
        </Badge>
      )}
    </div>
    <div className="flex items-center justify-between">
      <span>Authentication</span>
      {auth ? (
        <Badge variant="success" className="bg-green-500">
          <CheckCircle className="h-4 w-4 mr-1" /> Active
        </Badge>
      ) : (
        <Badge variant="destructive">
          <AlertCircle className="h-4 w-4 mr-1" /> Not Authenticated
        </Badge>
      )}
    </div>
    <div className="flex items-center justify-between">
      <span>Edge Functions</span>
      {edgeFunctions ? (
        <Badge variant="success" className="bg-green-500">
          <CheckCircle className="h-4 w-4 mr-1" /> Available
        </Badge>
      ) : (
        <Badge variant="destructive">
          <AlertCircle className="h-4 w-4 mr-1" /> Unavailable
        </Badge>
      )}
    </div>
    <div className="flex items-center justify-between">
      <span>Maintenance Mode</span>
      {maintenance === null ? (
        <Badge variant="outline">
          <AlertCircle className="h-4 w-4 mr-1" /> Unknown
        </Badge>
      ) : maintenance ? (
        <Badge variant="danger" className="bg-yellow-500 text-black">
          <AlertCircle className="h-4 w-4 mr-1" /> Enabled
        </Badge>
      ) : (
        <Badge variant="success" className="bg-green-500">
          <CheckCircle className="h-4 w-4 mr-1" /> Disabled
        </Badge>
      )}
    </div>
  </div>
);

export default HealthStatusSection;
