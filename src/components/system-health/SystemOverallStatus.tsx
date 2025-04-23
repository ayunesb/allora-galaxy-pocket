
import React from "react";
import SystemOverallAlert from "./SystemOverallAlert";

interface SystemOverallStatusProps {
  status: Record<string, any>;
}

export const SystemOverallStatus: React.FC<SystemOverallStatusProps> = ({ status }) => (
  <SystemOverallAlert status={status} />
);
