
import React from "react";
import SystemConfigAlert from "./SystemConfigAlert";

interface SystemConfigCreationProps {
  show: boolean;
  onCreate: () => void;
}

export const SystemConfigCreation: React.FC<SystemConfigCreationProps> = ({ show, onCreate }) => (
  <SystemConfigAlert show={show} onCreateSystemConfig={onCreate} />
);
