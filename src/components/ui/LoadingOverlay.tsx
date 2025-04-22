
import React from "react";
import LoadingSpinner from "./LoadingSpinner";

interface LoadingOverlayProps {
  show: boolean;
  label?: string;
}

const overlayStyle = "fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-sm";

export default function LoadingOverlay({ show, label }: LoadingOverlayProps) {
  if (!show) return null;
  return (
    <div className={overlayStyle} role="alert" aria-busy="true" aria-live="polite" tabIndex={-1}>
      <LoadingSpinner size={40} label={label ?? "Loading..."} />
    </div>
  );
}
