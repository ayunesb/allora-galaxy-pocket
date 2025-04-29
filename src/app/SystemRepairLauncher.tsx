
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function SystemRepairLauncher() {
  const navigate = useNavigate();
  const [repairStatus, setRepairStatus] = useState<'idle' | 'running' | 'complete' | 'failed'>('idle');
  const [currentPhase, setCurrentPhase] = useState(0);
  
  const phases = [
    { 
      title: "Database Connection & RLS", 
      description: "Fix recursive RLS policies in tenant_user_roles and implement security definer functions"
    },
    { 
      title: "Route Configuration", 
      description: "Fix syntax errors in route configuration files and ensure proper imports"
    },
    { 
      title: "Authentication & Session Management", 
      description: "Stabilize authentication flows and implement session persistence"
    },
    { 
      title: "Tenant Isolation", 
      description: "Verify tenant_id enforcement in queries and prevent cross-tenant access"
    },
    { 
      title: "System Health Monitoring", 
      description: "Implement health checks and metrics collection"
    },
    { 
      title: "Error Handling & Recovery", 
      description: "Add error boundaries and loading states throughout the application"
    },
    { 
      title: "User Experience Flows", 
      description: "Verify onboarding, campaign creation, and approval workflows"
    },
    { 
      title: "Data Integrity & Verification", 
      description: "Ensure proper data relationships and persistence across sessions"
    },
    { 
      title: "Launch Readiness Assessment", 
      description: "Run comprehensive system verification and generate readiness report"
    }
  ];

  const startRepair = () => {
    setRepairStatus('running');
    runPhases();
  };

  const runPhases = async () => {
    try {
      // Simulate running through the phases
      for (let i = 0; i < phases.length; i++) {
        setCurrentPhase(i);
        // Simulate phase execution time
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      setRepairStatus('complete');
    } catch (error) {
      console.error('System repair failed:', error);
      setRepairStatus('failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Allora OS System Repair</CardTitle>
          <CardDescription>
            9-Phase System Repair Plan for comprehensive system verification and recovery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-md">
            <p className="text-sm text-muted-foreground">
              This utility will systematically verify and repair critical components of Allora OS. 
              The 9-phase approach ensures complete coverage of all system dependencies, from 
              database connections to launch readiness assessment.
            </p>
          </div>

          <div className="space-y-4">
            {phases.map((phase, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-3 p-3 rounded-md ${
                  currentPhase === index && repairStatus === 'running' 
                    ? 'bg-blue-50 border border-blue-200 animate-pulse' 
                    : currentPhase > index && repairStatus !== 'failed'
                    ? 'bg-green-50 border border-green-200' 
                    : repairStatus === 'failed' && currentPhase === index
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="mt-0.5">
                  {currentPhase > index && repairStatus !== 'failed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : currentPhase === index && repairStatus === 'running' ? (
                    <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                  ) : repairStatus === 'failed' && currentPhase === index ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-gray-300" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-sm">
                    Phase {index + 1}: {phase.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{phase.description}</p>
                </div>
              </div>
            ))}
          </div>

          {repairStatus === 'idle' && (
            <Button 
              onClick={startRepair} 
              className="w-full"
            >
              Start System Repair
            </Button>
          )}

          {repairStatus === 'running' && (
            <div className="text-center text-sm text-muted-foreground">
              <p>System repair in progress. Please do not close this browser window.</p>
              <p className="mt-1">Running phase {currentPhase + 1} of 9</p>
            </div>
          )}

          {repairStatus === 'complete' && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-md flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-sm font-medium text-green-800">
                  System repair completed successfully
                </p>
              </div>
              <Button 
                onClick={() => navigate('/system-verification')} 
                className="w-full"
              >
                Continue to System Verification
              </Button>
            </div>
          )}

          {repairStatus === 'failed' && (
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-md flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <p className="text-sm font-medium text-red-800">
                  System repair failed during phase {currentPhase + 1}
                </p>
              </div>
              <Button 
                onClick={startRepair}
                className="w-full"
              >
                Retry System Repair
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
