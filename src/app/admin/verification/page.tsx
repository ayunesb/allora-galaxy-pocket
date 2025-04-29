
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { ToastService } from '@/services/ToastService';

export default function VerificationPage() {
  const [verificationStatus, setVerificationStatus] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState(false);
  const { verifyModuleImplementation } = useSystemLogs();
  
  const modules = [
    { path: '/auth/security', name: 'Authentication & Security' },
    { path: '/database/rls', name: 'Database RLS' },
    { path: '/integrations/api', name: 'External API Integration' }
  ];
  
  const runVerification = async () => {
    setIsRunning(true);
    try {
      const statuses: Record<string, any> = {};
      
      for (const module of modules) {
        // Fix: Pass only one argument to verifyModuleImplementation
        const result = await verifyModuleImplementation(module.path);
        statuses[module.path] = result.message || { 
          verified: false, 
          phase1Complete: false,
          phase2Complete: false,
          modulePath: module.path
        };
      }
      
      setVerificationStatus(statuses);
      ToastService.success("Verification complete");
    } catch (error) {
      console.error("Verification error:", error);
      ToastService.error("Verification failed");
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>System Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={runVerification} disabled={isRunning}>
              {isRunning ? 'Running verification...' : 'Run Verification'}
            </Button>
          </div>
          
          {modules.map((module) => (
            <div key={module.path} className="mb-4 p-4 border rounded-md">
              <h3 className="font-medium text-lg mb-2">{module.name}</h3>
              {verificationStatus[module.path] ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span>{verificationStatus[module.path].verified ? 'Verified' : 'Not Verified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phase 1:</span>
                    <span>{verificationStatus[module.path].phase1Complete ? 'Complete' : 'Incomplete'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phase 2:</span>
                    <span>{verificationStatus[module.path].phase2Complete ? 'Complete' : 'Incomplete'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Not verified yet</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
