
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle, Shield, Wrench } from "lucide-react";

export default function SystemRepairLauncher() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <Card className="mb-8 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-indigo-500" />
            <CardTitle className="text-2xl font-bold">Allora OS System Repair</CardTitle>
          </div>
          <CardDescription className="text-base">
            Systematic troubleshooting and repair for core system functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-amber-800">System Issues Detected</h3>
                  <p className="text-amber-700 mt-1">
                    The diagnostics have identified several system issues that need to be addressed
                    before proceeding with normal operation.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" 
                    onClick={() => navigate('/admin/system-repair')}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">System Repair Dashboard</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Begin the 9-phase system repair process to fix core functionality.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/security-audit')}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Security Audit</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Run a complete security audit of RLS policies and tenant isolation.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/system-status')}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">System Status Check</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Verify the health and status of all system components.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/launch-readiness')}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Launch Readiness Report</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Generate a comprehensive launch readiness report.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-center mt-4">
              <Button onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>Allora OS System Repair Tool • Version 1.0.0</p>
        <p className="mt-1">Run all repair phases in order for best results</p>
      </div>
    </div>
  );
}
