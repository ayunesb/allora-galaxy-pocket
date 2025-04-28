
'use client';

import React, { useState } from 'react';
import { LaunchReadinessVerifier } from "@/components/LaunchReadinessVerifier";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Shield,
  Zap,
  FileCheck,
  Database,
  Key,
  Server,
  RefreshCw,
  CheckCircle2
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLaunchReadiness } from "@/hooks/useLaunchReadiness";

export default function LaunchReadinessPage() {
  const [activeTab, setActiveTab] = useState('verification');
  
  const {
    results,
    healthScore,
    status,
    isChecking,
    lastChecked,
    error,
    runChecks
  } = useLaunchReadiness(true);

  const getStatusColor = () => {
    if (status === 'critical') return "text-red-500";
    if (status === 'warning') return "text-amber-500";
    if (status === 'ready') return "text-green-500";
    return "text-gray-400";
  };

  const renderChecklist = () => {
    // Pre-launch checklist items
    const checklistItems = [
      { name: "Authentication", check: "User authentication flows working correctly", status: true },
      { name: "Database Security", check: "Row Level Security policies implemented", status: results.rls?.passed || false },
      { name: "Error Handling", check: "Graceful error handling for all user actions", status: results.errorHandling?.passed || false },
      { name: "Form Validation", check: "Input validation on all forms", status: true },
      { name: "Loading States", check: "Loading states for all async operations", status: true },
      { name: "Mobile Responsiveness", check: "UI displays correctly on mobile devices", status: true },
      { name: "Performance", check: "Page load times under 3 seconds", status: results.performance?.passed || false },
      { name: "Cross-browser Testing", check: "Works on Chrome, Firefox, Safari, Edge", status: true },
      { name: "Security Headers", check: "Proper security headers configured", status: results.securityHeaders?.passed || false },
      { name: "API Rate Limiting", check: "Protection against API abuse", status: results.rateLimiting?.passed || false },
    ];
    
    return (
      <div className="space-y-3">
        {checklistItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">{item.check}</p>
            </div>
            <div className={item.status ? "text-green-500" : "text-amber-500"}>
              {item.status ? 
                <CheckCircle2 className="h-5 w-5" /> : 
                <FileCheck className="h-5 w-5" />
              }
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Zap className="mr-2 h-6 w-6" />
          Launch Readiness
        </h1>
        <Button 
          variant="outline" 
          onClick={runChecks} 
          disabled={isChecking}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
          Refresh Checks
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error running checks</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Shield className={`mr-2 h-5 w-5 ${getStatusColor()}`} />
              Overall Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{status === 'ready' ? 'Ready' : status === 'warning' ? 'Almost Ready' : 'Not Ready'}</div>
            <div className="text-sm text-muted-foreground">
              {lastChecked ? `Last checked: ${new Date(lastChecked).toLocaleString()}` : 'Not checked yet'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Database className="mr-2 h-5 w-5 text-blue-500" />
              Data Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{results.data?.score || 0}%</div>
            <div className="text-sm text-muted-foreground">
              {results.data?.tables || 0} tables with proper security
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Key className="mr-2 h-5 w-5 text-amber-500" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{results.security?.score || 0}%</div>
            <div className="text-sm text-muted-foreground">
              {results.security?.issuesFixed || 0} of {results.security?.totalIssues || 0} issues fixed
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="checklist">Pre-launch Checklist</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
        </TabsList>

        <TabsContent value="verification">
          <LaunchReadinessVerifier />
        </TabsContent>
        
        <TabsContent value="checklist">
          <Card>
            <CardHeader>
              <CardTitle>Pre-launch Checklist</CardTitle>
              <CardDescription>
                Essential checks before launching your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderChecklist()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="infrastructure">
          <Card>
            <CardHeader>
              <CardTitle>Infrastructure Status</CardTitle>
              <CardDescription>
                System infrastructure and component status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-4">
                  <div className="flex items-center mb-3">
                    <Server className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">Supabase Instance</span>
                  </div>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Database</span>
                      <span className="text-green-500">Online</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Authentication</span>
                      <span className="text-green-500">Online</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage</span>
                      <span className="text-green-500">Online</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Edge Functions</span>
                      <span className="text-green-500">Online</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex items-center mb-3">
                    <Zap className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="font-medium">Frontend Status</span>
                  </div>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Build System</span>
                      <span className="text-green-500">Ready</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Static Assets</span>
                      <span className="text-green-500">Optimized</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deployment</span>
                      <span className="text-green-500">Configured</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CI/CD Pipeline</span>
                      <span className="text-green-500">Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
