'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { toast } from "sonner";

interface ModuleStatus {
  [key: string]: {
    verified: boolean;
    phase1Complete: boolean;
    phase2Complete: boolean;
    phase3Complete: boolean;
    modulePath: string;
    options: any;
  };
}

export default function JourneyVerification() {
  const [moduleStatus, setModuleStatus] = useState<ModuleStatus>({});
  const { verifyModuleImplementation } = useSystemLogs();

  const modules = [
    { path: '/auth/security', label: 'Auth Security' },
    { path: '/integration/ga4', label: 'GA4 Integration' },
    { path: '/billing/stripe', label: 'Stripe Billing' },
  ];

  useEffect(() => {
    const verifyAllModules = async () => {
      for (const module of modules) {
        await verifyModule(module.path);
      }
    };

    verifyAllModules();
  }, []);

  const verifyModule = async (modulePath: string) => {
    try {
      const result = await verifyModuleImplementation(modulePath, { requireAuth: true });

      if (result && result.verified) {
        setModuleStatus(prev => ({
          ...prev,
          [modulePath]: result
        }));
        toast.success(`${modulePath} verification ${result.verified ? 'passed' : 'failed'}`);
      } else {
        toast.error(`${modulePath} verification failed`);
      }
    } catch (error) {
      console.error(`Error verifying ${modulePath}:`, error);
      toast.error(`Error verifying ${modulePath}`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Journey Verification</h1>
      <p className="text-muted-foreground mb-4">
        Verify key system integrations and security measures.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card key={module.path}>
            <CardHeader>
              <CardTitle>{module.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {moduleStatus[module.path] ? (
                <>
                  <div className="flex items-center text-sm text-green-500">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verified
                  </div>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>Phase 1: {moduleStatus[module.path].phase1Complete ? 'Complete' : 'Incomplete'}</li>
                    <li>Phase 2: {moduleStatus[module.path].phase2Complete ? 'Complete' : 'Incomplete'}</li>
                    <li>Phase 3: {moduleStatus[module.path].phase3Complete ? 'Complete' : 'Incomplete'}</li>
                  </ul>
                </>
              ) : (
                <div className="flex items-center text-sm text-yellow-500">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Verifying...
                </div>
              )}
              <Button variant="outline" onClick={() => verifyModule(module.path)}>
                Re-verify
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
