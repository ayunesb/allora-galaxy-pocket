import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { VerificationIndicator } from '@/components/VerificationIndicator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

const CORE_MODULES = [
  { path: 'auth', name: 'Authentication' },
  { path: 'onboarding', name: 'Onboarding' },
  { path: 'strategy', name: 'Strategy' },
  { path: 'campaign', name: 'Campaign' },
  { path: 'execution', name: 'Execution' },
  { path: 'kpi', name: 'KPI Dashboard' },
];

export default function VerificationPage() {
  const { verifyModuleImplementation } = useSystemLogs();
  const [verificationResults, setVerificationResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const verifyAllModules = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results: Record<string, any> = {};
      
      for (const module of CORE_MODULES) {
        const result = await verifyModuleImplementation(module.path);
        results[module.path] = result;
      }
      
      setVerificationResults(results);
    } catch (err: any) {
      setError(err.message || 'Failed to verify modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyAllModules();
  }, []);

  const getCompletionSummary = () => {
    const total = CORE_MODULES.length * 3; // 3 phases per module
    let completed = 0;
    
    Object.values(verificationResults).forEach((result: any) => {
      if (result?.phase1Complete) completed++;
      if (result?.phase2Complete) completed++;
      if (result?.phase3Complete) completed++;
    });
    
    return {
      percentage: Math.round((completed / total) * 100),
      completed,
      total
    };
  };

  const summary = getCompletionSummary();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Three-Phase Implementation Verification</h1>
          <p className="text-muted-foreground">
            Verifying that each module follows the required three-phase approach
          </p>
        </div>
        <Button 
          onClick={verifyAllModules} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
          {!loading && <RefreshCw className="h-4 w-4" />}
          Run Verification
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            Implementation Progress: {summary.percentage}% Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-200 rounded-full h-2.5 mb-6">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${summary.percentage}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CORE_MODULES.map((module) => {
              const result = verificationResults[module.path] || {
                phase1Complete: false,
                phase2Complete: false,
                phase3Complete: false
              };
              
              return (
                <VerificationIndicator
                  key={module.path}
                  moduleName={module.name}
                  phase1Complete={result.phase1Complete}
                  phase2Complete={result.phase2Complete}
                  phase3Complete={result.phase3Complete}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Module Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {CORE_MODULES.map((module) => {
              const result = verificationResults[module.path];
              if (!result) return null;
              
              return (
                <div key={module.path} className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-2">{module.name}</h3>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>Phase 1: Fix errors & implement functionality</span>
                      {result.phase1Complete ? 
                        <span className="text-green-600">Completed</span> : 
                        <span className="text-amber-600">Pending</span>
                      }
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>Phase 2: Error handling & edge cases</span>
                      {result.phase2Complete ? 
                        <span className="text-green-600">Completed</span> : 
                        <span className="text-amber-600">Pending</span>
                      }
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>Phase 3: Role-based testing</span>
                      {result.phase3Complete ? 
                        <span className="text-green-600">Completed</span> : 
                        <span className="text-amber-600">Pending</span>
                      }
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
