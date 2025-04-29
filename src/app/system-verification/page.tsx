
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LaunchReadinessVerifier } from "@/components/LaunchReadinessVerifier";
import { SecurityHealthCheck } from "@/components/SecurityHealthCheck";
import { useLaunchReadiness } from "@/hooks/useLaunchReadiness";

export default function SystemVerificationPage() {
  const { runChecks, healthScore, status } = useLaunchReadiness(false);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">System Verification</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>System Verification Dashboard</CardTitle>
            <CardDescription>
              Comprehensive verification of system health and security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="mb-4">
                This dashboard provides tools to verify and repair the Allora OS system. 
                The 9-phase system repair plan ensures all components are functioning correctly 
                before proceeding to production use.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={runChecks}>
                  Run Health Check
                </Button>
                <Button variant="outline" asChild>
                  <a href="/admin/system-repair-launcher">Launch System Repair</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <SecurityHealthCheck />
        
        <LaunchReadinessVerifier />
      </div>
    </div>
  );
}
