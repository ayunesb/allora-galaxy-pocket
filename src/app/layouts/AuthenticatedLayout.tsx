
import React from "react";
import Layout from "@/components/Layout";
import { useRouteMonitoring } from "@/hooks/useRouteMonitoring";
import { useTenantDataProtection } from "@/hooks/useTenantDataProtection";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  // Monitor route access for audit purposes
  useRouteMonitoring();
  
  // Ensure tenant data isolation
  useTenantDataProtection();
  
  return <Layout>{children}</Layout>;
};

export default AuthenticatedLayout;
