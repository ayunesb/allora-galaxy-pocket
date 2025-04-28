
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LaunchReadinessVerifier } from "@/components/LaunchReadinessVerifier";
import LaunchReadinessReport from "@/components/system/LaunchReadinessReport";

export default function LaunchReadinessPage() {
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Launch Readiness Dashboard</h1>
      
      <Tabs defaultValue="report" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="report">Executive Summary</TabsTrigger>
          <TabsTrigger value="verification">System Verification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="report" className="space-y-6">
          <LaunchReadinessReport />
        </TabsContent>
        
        <TabsContent value="verification" className="space-y-6">
          <LaunchReadinessVerifier />
        </TabsContent>
      </Tabs>
    </div>
  );
}
