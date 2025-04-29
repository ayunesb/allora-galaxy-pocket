
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertTriangle, Wrench, Shield, Database, FileSearch, Activity } from "lucide-react";

export default function SystemRepairLauncher() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-red-100">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">System Repair Required</h1>
          <p className="text-lg text-muted-foreground">
            Critical system issues have been detected. Launch system repair to restore functionality.
          </p>
        </div>
        
        <Card className="mb-6 border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Wrench className="h-5 w-5" /> 9-Phase System Repair Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <Link to="/admin/system-repair">
                  <Button className="w-full" size="lg">
                    Launch System Repair
                  </Button>
                </Link>
              </div>
              
              <p className="text-sm text-muted-foreground">
                The system repair process will diagnose and fix issues in database connectivity,
                authentication, RLS policies, tenant isolation, and other critical components.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Link to="/admin/system-health" className="block">
            <Card className="h-full hover:border-primary transition-colors">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="p-3 mb-2 rounded-full bg-blue-100">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium mb-1">System Health</h3>
                <p className="text-sm text-muted-foreground">Monitor system vitals and component status</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/security-audit" className="block">
            <Card className="h-full hover:border-primary transition-colors">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="p-3 mb-2 rounded-full bg-amber-100">
                  <Shield className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-medium mb-1">Security Audit</h3>
                <p className="text-sm text-muted-foreground">Review RLS policies and security configurations</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/system/connection-test" className="block">
            <Card className="h-full hover:border-primary transition-colors">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="p-3 mb-2 rounded-full bg-green-100">
                  <Database className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium mb-1">Connection Test</h3>
                <p className="text-sm text-muted-foreground">Verify database and API connections</p>
              </CardContent>
            </Card>
          </Link>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>After completing system repair, verify all functionality before proceeding to production use.</p>
        </div>
      </div>
    </div>
  );
}
