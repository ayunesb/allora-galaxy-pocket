
import React from "react";
import { SecurityAuditTips } from "./components/SecurityAuditTips";
import SystemHealthCheck from "@/components/SystemHealthCheck";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import RlsAuditReport from "./RlsAuditReport";
import SecurityDashboard from "./SecurityDashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, Shield, Database, LockKeyhole, RefreshCcw } from "lucide-react";
import { KpiCampaignTracker } from "@/components/KpiCampaignTracker";
import { DemoResetButton } from "@/components/DemoResetButton";

export default function SecurityAuditPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Security & System Health</h1>
        <div className="flex gap-2">
          <DemoResetButton />
          <Button size="sm">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Add KPI tracker to ensure alerts are checked regularly */}
      <KpiCampaignTracker />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-500" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Overview of your application's security configuration
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between border px-3 py-2 rounded-md">
                <span>Row Level Security</span>
                <span className="text-green-500 font-medium">Enabled</span>
              </div>
              <div className="flex items-center justify-between border px-3 py-2 rounded-md">
                <span>Auth Policies</span>
                <span className="text-green-500 font-medium">Configured</span>
              </div>
              <div className="flex items-center justify-between border px-3 py-2 rounded-md">
                <span>Tenant Isolation</span>
                <span className="text-green-500 font-medium">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-blue-500" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Key system metrics and automated processes
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between border px-3 py-2 rounded-md">
                <span>KPI Alerts</span>
                <span className="text-green-500 font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between border px-3 py-2 rounded-md">
                <span>Billing Automation</span>
                <span className="text-green-500 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between border px-3 py-2 rounded-md">
                <span>Demo Reset</span>
                <span className="text-green-500 font-medium">Configured</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="rls">RLS Audit</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="tips">Tips</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <SecurityDashboard />
        </TabsContent>
        
        <TabsContent value="rls">
          <RlsAuditReport />
        </TabsContent>
        
        <TabsContent value="health">
          <SystemHealthCheck />
        </TabsContent>
        
        <TabsContent value="tips">
          <SecurityAuditTips />
        </TabsContent>
      </Tabs>
    </div>
  );
}
