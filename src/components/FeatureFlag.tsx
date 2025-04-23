
import React from "react";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

interface FeatureFlagProps {
  flag: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Component that conditionally renders content based on feature flag status
 */
export function FeatureFlag({ flag, fallback = null, children }: FeatureFlagProps) {
  const { isEnabled, isLoading } = useFeatureFlags();
  
  // While loading, avoid flashing content by rendering nothing
  if (isLoading) return null;
  
  // Render children if the flag is enabled, otherwise render fallback
  return isEnabled(flag) ? <>{children}</> : <>{fallback}</>;
}

export default FeatureFlag;
