import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { LogSecurityAlert } from "@/components/logging/LogSecurityAlert";
import { ToastService } from "@/services/ToastService";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function JourneyVerificationPage() {
  const { logJourneyStep, verifyModuleImplementation, logActivity } = useSystemLogs();
  const [currentStep, setCurrentStep] = useState<string>('authentication');
  const [journeyLogs, setJourneyLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResults, setVerificationResults] = useState<Record<string, any>>({});

  const journeySteps = [
    { id: 'authentication', name: 'Authentication', next: 'onboarding' },
    { id: 'onboarding', name: 'Onboarding', next: 'strategy' },
    { id: 'strategy', name: 'Strategy', next: 'campaign' },
    { id: 'campaign', name: 'Campaign', next: 'execution' },
    { id: 'execution', name: 'Execution', next: 'kpi' },
    { id: 'kpi', name: 'KPI', next: null },
  ];
  
  const modules = [
    'auth/login', 
    'onboarding/wizard', 
    'strategy/page', 
    'campaign/center', 
    'execution/tracking', 
    'kpi/dashboard'
  ];

  useEffect(() => {
    // Simulate loading journey logs
    const fetchJourneyLogs = async () => {
      setIsLoading(true);
      try {
        const { data } = await fetch('/api/logs?eventType=USER_JOURNEY&limit=20')
          .then(res => res.json());
        
        setJourneyLogs(data || []);
      } catch (error) {
        console.error("Error fetching journey logs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJourneyLogs();
  }, []);
  
  const simulateJourneyStep = async (from: string, to: string) => {
    setIsLoading(true);
    try {
      await logJourneyStep(from, to, {
        simulation: true,
        timestamp: new Date().toISOString()
      });
      
      ToastService.success({
        title: "Journey step logged",
        description: `Transition from ${from} to ${to} recorded`
      });
      
      // Update the current step
      setCurrentStep(to);
      
      // Refresh journey logs
      const { data } = await fetch('/api/logs?eventType=USER_JOURNEY&limit=20')
        .then(res => res.json());
      
      setJourneyLogs(data || []);
    } catch (error) {
      console.error("Failed to log journey step:", error);
      ToastService.error({
        title: "Failed to log step",
        description: "There was an error recording this journey step"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const verifyModuleImplementations = async () => {
    setIsLoading(true);
    const results: Record<string, any> = {};
    
    for (const module of modules) {
      try {
        const result = await verifyModuleImplementation(module);
        results[module] = result;
        
        // Log verification success/failure
        await logActivity({
          event_type: result.verified ? 'MODULE_VERIFICATION_SUCCESS' : 'MODULE_VERIFICATION_FAILURE',
          message: `Module ${module} verification ${result.verified ? 'passed' : 'failed'}`,
          meta: result,
          severity: result.verified ? 'info' : 'warning'
        });
      } catch (error) {
        console.error(`Verification failed for ${module}:`, error);
        results[module] = { verified: false, reason: 'Verification error' };
      }
    }
    
    setVerificationResults(results);
    setIsLoading(false);
  };
  
  const getCurrentStep = () => {
    return journeySteps.find(step => step.id === currentStep) || journeySteps[0];
  };
  
  const getNextStep = () => {
    const current = getCurrentStep();
    if (!current.next) return null;
    return journeySteps.find(step => step.id === current.next);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">User Journey Verification</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Journey Flow Tester</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">User Journey Steps</h3>
                <div className="flex overflow-x-auto pb-2">
                  {journeySteps.map((step, index) => (
                    <React.Fragment key={step.id}>
                      <div className="flex flex-col items-center">
                        <Badge
                          className={`px-3 py-1 ${
                            currentStep === step.id
                              ? "bg-primary text-primary-foreground"
                              : ""
                          }`}
                        >
                          {step.name}
                        </Badge>
                      </div>
                      {index < journeySteps.length - 1 && (
                        <div className="mx-2 flex items-center">→</div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Current Step: {getCurrentStep()?.name}</h3>
                {getNextStep() && (
                  <Button
                    onClick={() => simulateJourneyStep(currentStep, getNextStep()?.id || '')}
                    disabled={isLoading}
                  >
                    Advance to {getNextStep()?.name}
                  </Button>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Module Verification</h3>
                  <Button onClick={verifyModuleImplementations} disabled={isLoading}>
                    Verify All Modules
                  </Button>
                </div>
                
                {Object.keys(verificationResults).length > 0 && (
                  <div className="grid gap-3">
                    {modules.map(module => {
                      const result = verificationResults[module] || {};
                      return (
                        <div key={module} className="flex justify-between border rounded-md p-3">
                          <span className="font-medium">{module}</span>
                          {result.verified ? (
                            <Badge className="bg-green-500">Verified</Badge>
                          ) : (
                            <Badge variant="outline" className="text-destructive border-destructive">
                              Not Verified
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Log security alert demo */}
          <div className="mt-6">
            <LogSecurityAlert
              title="Journey Verification in Progress"
              description="This is a demonstration of the LogSecurityAlert component showing how security alerts appear in the system."
              severity="medium"
              timestamp={new Date().toISOString()}
              source="journey_verification"
              actionable={true}
              metadata={{
                demo: true,
                current_step: currentStep
              }}
            />
          </div>
        </div>
        
        <Card className="h-min">
          <CardHeader>
            <CardTitle>Recent Journey Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading logs...</div>
            ) : journeyLogs.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No journey logs found. Use the journey tester to create logs.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {journeyLogs.map((log: any, i) => (
                  <div key={i} className="border rounded-md p-3 text-sm">
                    <div className="flex justify-between">
                      <Badge variant="outline">{log.event_type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                      </span>
                    </div>
                    <p className="mt-2">{log.message}</p>
                    {log.meta && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {log.meta.from && log.meta.to && (
                          <span>
                            {log.meta.from} → {log.meta.to}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
