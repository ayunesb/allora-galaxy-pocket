
import React from "react";
import HealthStatusSection from "./HealthStatusSection";

interface SystemStatusDetailsProps {
  database: boolean;
  auth: boolean;
  edgeFunctions: boolean;
  maintenance: null | boolean;
}

const SystemStatusDetails: React.FC<SystemStatusDetailsProps> = ({
  database,
  auth,
  edgeFunctions,
  maintenance
}) => (
  <div className="mb-6">
    <HealthStatusSection
      database={database}
      auth={auth}
      edgeFunctions={edgeFunctions}
      maintenance={maintenance}
    />
  </div>
);

export default SystemStatusDetails;
