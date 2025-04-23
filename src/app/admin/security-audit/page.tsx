
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import RlsAuditReport from "./RlsAuditReport";
import SecurityDashboard from "./SecurityDashboard";
import SystemHealthCheck from "@/components/SystemHealthCheck";

export default function SecurityAuditPage() {
  const { role, isLoading } = useUserRole();
  
  // Only admins can access this page
  if (!isLoading && role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Security Center</h1>
      
      <Tabs defaultValue="dashboard">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="rls">RLS Audit</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <SecurityDashboard />
        </TabsContent>
        
        <TabsContent value="rls">
          <RlsAuditReport />
        </TabsContent>
        
        <TabsContent value="health">
          <div className="flex justify-center">
            <SystemHealthCheck />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
