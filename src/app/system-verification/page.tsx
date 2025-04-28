
import React from 'react';
import SystemVerificationReport from '@/components/SystemVerificationReport';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Download, FileText, PlusCircle, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminOnly from '@/guards/AdminOnly';

export default function SystemVerificationPage() {
  return (
    <AdminOnly>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">System Verification</h1>
            <p className="text-muted-foreground">
              Comprehensive verification of all system components and launch readiness
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              Run Again
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="details">Detailed Report</TabsTrigger>
            <TabsTrigger value="issues">Issues (5)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Launch Grade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <span className="text-4xl font-bold text-amber-600">C</span>
                    <AlertCircle className="h-6 w-6 text-amber-600 ml-2" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Not ready for launch</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Core Systems</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <span className="text-4xl font-bold text-amber-600">75%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">3/4 modules passing</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Critical Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <span className="text-4xl font-bold text-red-600">5</span>
                    <AlertCircle className="h-6 w-6 text-red-600 ml-2" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Must fix before launch</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Last Verified</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <span className="text-xl font-medium">Just now</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">April 28, 2025</p>
                </CardContent>
              </Card>
            </div>
            
            <SystemVerificationReport />
          </TabsContent>
          
          <TabsContent value="details">
            <div className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Detailed verification logs and test results will appear here.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="issues">
            <div className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Critical Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-1 flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        Infinite recursion detected in RLS policy for tenant_user_roles
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        The RLS policy for tenant_user_roles references itself, causing infinite recursion.
                      </p>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Security Issue</span>
                        <Button size="sm" variant="outline">Fix Issue</Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-1 flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        Missing RLS policies on several critical tables
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Several critical tables are missing proper RLS policies, risking data leakage.
                      </p>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Security Issue</span>
                        <Button size="sm" variant="outline">Fix Issue</Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-1 flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        TypeScript build errors preventing deployment
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Multiple TypeScript errors must be resolved before deployment.
                      </p>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Build Issue</span>
                        <Button size="sm" variant="outline">View Errors</Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-1 flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        API calls failing with "Failed to fetch" errors
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Multiple API endpoints are failing with network errors.
                      </p>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Runtime Issue</span>
                        <Button size="sm" variant="outline">Debug API</Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-1 flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        Missing fallback UIs for loading states
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Several critical flows are missing proper loading states and error fallbacks.
                      </p>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">UX Issue</span>
                        <Button size="sm" variant="outline">View Components</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminOnly>
  );
}
