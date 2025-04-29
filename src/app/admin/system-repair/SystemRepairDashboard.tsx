
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, XCircle, ArrowRight } from "lucide-react";

export default function SystemRepairDashboard() {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [phaseStatuses, setPhaseStatuses] = useState({
    1: 'in-progress',
    2: 'pending',
    3: 'pending',
    4: 'pending',
    5: 'pending',
    6: 'pending',
    7: 'pending',
    8: 'pending',
    9: 'pending'
  });
  
  const phases = [
    { id: 1, title: "Database Connection Verification", description: "Verify Supabase connection and RLS policy configurations" },
    { id: 2, title: "Route Structure Repair", description: "Fix routing configuration and navigation structure" },
    { id: 3, title: "Authentication System Validation", description: "Validate authentication flows and session management" },
    { id: 4, title: "Tenant Isolation Testing", description: "Test multi-tenant data isolation and access controls" },
    { id: 5, title: "System Monitoring Setup", description: "Configure monitoring for core system components" },
    { id: 6, title: "Error Handling Implementation", description: "Implement robust error handling and recovery" },
    { id: 7, title: "User Flow Verification", description: "Test critical user flows and interactions" },
    { id: 8, title: "Data Integrity Check", description: "Verify data consistency across related tables" },
    { id: 9, title: "Launch Readiness Verification", description: "Final pre-launch system verification" }
  ];
  
  const startPhase = (phaseId) => {
    // Update current phase
    setCurrentPhase(phaseId);
    
    // Set phase status to in-progress
    setPhaseStatuses(prev => ({
      ...prev,
      [phaseId]: 'in-progress'
    }));
    
    // Simulate phase execution (in a real app, this would perform the actual repair actions)
    setTimeout(() => {
      setPhaseStatuses(prev => ({
        ...prev,
        [phaseId]: 'completed'
      }));
      
      // Move to next phase if available
      if (phaseId < 9) {
        setCurrentPhase(phaseId + 1);
      }
    }, 2000);
  };
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500"><ArrowRight className="h-3 w-3 mr-1" /> In Progress</Badge>;
      case 'failed':
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge className="bg-gray-400">Pending</Badge>;
    }
  };
  
  const getProgressPercentage = () => {
    const completed = Object.values(phaseStatuses).filter(status => status === 'completed').length;
    return (completed / 9) * 100;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 border-2 border-primary/20">
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-2xl flex items-center gap-2">
            System Repair Dashboard
            <Badge variant="outline" className="ml-2 text-xs">v1.0</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Overall Progress</h3>
              <span className="text-sm">{Math.round(getProgressPercentage())}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
          
          <Alert className="mb-6 bg-amber-50 text-amber-800 border-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>System repair in progress</AlertTitle>
            <AlertDescription>
              Complete all 9 phases to restore full system functionality. Run each phase in order.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            {phases.map(phase => (
              <Card key={phase.id} className={`border ${currentPhase === phase.id ? 'border-primary' : 'border-border'}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium flex items-center">
                        Phase {phase.id}: {phase.title}
                        <span className="ml-3">
                          {getStatusBadge(phaseStatuses[phase.id])}
                        </span>
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => startPhase(phase.id)}
                      disabled={phase.id !== currentPhase && phaseStatuses[phase.id] !== 'completed'}
                    >
                      {phaseStatuses[phase.id] === 'completed' ? 'Rerun' : 'Start'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-muted-foreground mt-4">
        <p>Ensure all phases complete successfully before returning to normal operation</p>
      </div>
    </div>
  );
}
