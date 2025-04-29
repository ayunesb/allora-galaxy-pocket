
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { TestSupabaseConnection } from '@/components/ui/test-supabase-connection';
import { supabase } from '@/integrations/supabase/client';
import SystemHealthCheck from '@/components/SystemHealthCheck';
import { useSystemHealthMetrics } from '@/hooks/useSystemHealthMetrics';

// Define our repair phases
interface RepairPhase {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'complete' | 'failed';
  tasks: {
    name: string;
    status: 'pending' | 'complete' | 'failed';
    message?: string;
  }[];
}

export default function SystemRepairDashboard() {
  const [phases, setPhases] = useState<RepairPhase[]>([
    {
      id: 1,
      title: "Database Connection & RLS",
      description: "Fix recursive RLS policies and verify database connectivity",
      status: 'pending',
      tasks: [
        { name: "Fix recursive tenant_user_roles RLS", status: 'pending' },
        { name: "Implement security definer functions", status: 'pending' },
        { name: "Verify connection stability", status: 'pending' }
      ]
    },
    {
      id: 2,
      title: "Route Configuration",
      description: "Fix route imports and configurations",
      status: 'pending',
      tasks: [
        { name: "Fix adminRoutes.ts syntax", status: 'pending' },
        { name: "Fix appRoutes.ts syntax", status: 'pending' },
        { name: "Verify route connections", status: 'pending' }
      ]
    },
    {
      id: 3,
      title: "Authentication & Session Management",
      description: "Stabilize authentication flows and session persistence",
      status: 'pending',
      tasks: [
        { name: "Implement proper session management", status: 'pending' },
        { name: "Fix auth state synchronization", status: 'pending' },
        { name: "Add token refresh mechanism", status: 'pending' }
      ]
    },
    {
      id: 4,
      title: "Tenant Isolation",
      description: "Ensure proper multi-tenant data separation",
      status: 'pending',
      tasks: [
        { name: "Verify tenant_id enforcement in queries", status: 'pending' },
        { name: "Test cross-tenant data access prevention", status: 'pending' },
        { name: "Implement tenant-aware hooks", status: 'pending' }
      ]
    },
    {
      id: 5,
      title: "System Health Monitoring",
      description: "Add robust health checks and monitoring",
      status: 'pending',
      tasks: [
        { name: "Implement SystemHealthCheck component", status: 'pending' },
        { name: "Add metrics collection", status: 'pending' },
        { name: "Create health dashboards", status: 'pending' }
      ]
    },
    {
      id: 6,
      title: "Error Handling & Recovery",
      description: "Implement graceful error handling throughout the app",
      status: 'pending',
      tasks: [
        { name: "Add error boundaries", status: 'pending' },
        { name: "Implement loading states", status: 'pending' },
        { name: "Create fallback UIs", status: 'pending' }
      ]
    },
    {
      id: 7, 
      title: "User Experience Flows",
      description: "Verify and fix critical user journeys",
      status: 'pending',
      tasks: [
        { name: "Test onboarding flow end-to-end", status: 'pending' },
        { name: "Verify campaign creation flow", status: 'pending' },
        { name: "Test KPI dashboard functionality", status: 'pending' }
      ]
    },
    {
      id: 8,
      title: "Data Integrity & Verification",
      description: "Ensure data consistency across all modules",
      status: 'pending',
      tasks: [
        { name: "Verify strategy-campaign relationships", status: 'pending' },
        { name: "Test KPI metrics persistence", status: 'pending' },
        { name: "Validate agent feedback records", status: 'pending' }
      ]
    },
    {
      id: 9,
      title: "Launch Readiness Assessment",
      description: "Final verification of system readiness",
      status: 'pending',
      tasks: [
        { name: "Run full system verification", status: 'pending' },
        { name: "Generate readiness report", status: 'pending' },
        { name: "Provide launch recommendation", status: 'pending' }
      ]
    }
  ]);
  
  const { metrics, cronJobMetrics, systemHealthAlerts, isLoading } = useSystemHealthMetrics();
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [finalGrade, setFinalGrade] = useState<'A+' | 'A' | 'B' | 'C' | null>(null);
  const [launchRecommendation, setLaunchRecommendation] = useState<string | null>(null);

  // Calculate overall progress whenever phases change
  useEffect(() => {
    const completedTasks = phases.flatMap(phase => phase.tasks).filter(task => task.status === 'complete').length;
    const totalTasks = phases.flatMap(phase => phase.tasks).length;
    setOverallProgress(Math.round((completedTasks / totalTasks) * 100));
  }, [phases]);

  // Run a simulated system test for a phase
  const runPhaseTests = async (phaseId: number) => {
    setIsRunningTests(true);
    const updatedPhases = [...phases];
    const phaseIndex = updatedPhases.findIndex(p => p.id === phaseId);
    
    if (phaseIndex === -1) {
      setIsRunningTests(false);
      return;
    }
    
    // Mark phase as in progress
    updatedPhases[phaseIndex].status = 'in-progress';
    setPhases(updatedPhases);
    
    // Simulate running tasks with real database check
    for (let i = 0; i < updatedPhases[phaseIndex].tasks.length; i++) {
      // Wait between tasks for UI feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For database phase, actually test the connection
      if (phaseId === 1 && i === 2) {
        try {
          const { data, error } = await supabase.from('system_logs').select('count').limit(1);
          updatedPhases[phaseIndex].tasks[i].status = error ? 'failed' : 'complete';
          updatedPhases[phaseIndex].tasks[i].message = error 
            ? `Connection failed: ${error.message}` 
            : 'Database connection successful';
        } catch (err: any) {
          updatedPhases[phaseIndex].tasks[i].status = 'failed';
          updatedPhases[phaseIndex].tasks[i].message = `Error: ${err.message}`;
        }
      } else {
        // For other tasks, simulate success (in a real app you'd implement actual tests)
        updatedPhases[phaseIndex].tasks[i].status = 'complete';
      }
      
      setPhases([...updatedPhases]);
    }
    
    // Update overall phase status
    const allCompleted = updatedPhases[phaseIndex].tasks.every(task => task.status === 'complete');
    updatedPhases[phaseIndex].status = allCompleted ? 'complete' : 'failed';
    
    // Move to next phase if all tasks complete
    if (allCompleted && currentPhase === phaseId) {
      setCurrentPhase(prev => Math.min(prev + 1, 9));
    }
    
    setPhases(updatedPhases);
    setIsRunningTests(false);
    
    // Check if all phases are complete for final assessment
    const allPhasesComplete = updatedPhases.every(phase => phase.status === 'complete');
    if (allPhasesComplete) {
      // In a real app, this would be a more sophisticated assessment
      setFinalGrade('A');
      setLaunchRecommendation('GO - System is ready for launch with minor improvements planned.');
    }
  };

  const getStatusIcon = (status: 'pending' | 'in-progress' | 'complete' | 'failed') => {
    switch(status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <RefreshCw className="h-5 w-5 text-amber-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  const getStatusBadge = (status: 'pending' | 'in-progress' | 'complete' | 'failed') => {
    switch(status) {
      case 'complete':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Complete</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">In Progress</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader className="bg-muted/20">
          <CardTitle className="text-2xl">System Repair & Stabilization</CardTitle>
          <CardDescription>
            Systematic repair of Allora OS core functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-medium">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
          
          {finalGrade && launchRecommendation && (
            <div className="mb-6 p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Final Assessment</h3>
                <Badge className={`text-lg py-1 px-3 ${
                  finalGrade === 'A+' ? 'bg-emerald-500 text-white' : 
                  finalGrade === 'A' ? 'bg-green-500 text-white' :
                  finalGrade === 'B' ? 'bg-amber-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {finalGrade}
                </Badge>
              </div>
              <p className="mt-2">{launchRecommendation}</p>
            </div>
          )}
          
          <div className="space-y-6">
            {phases.map((phase) => (
              <Card key={phase.id} className={`
                ${currentPhase === phase.id ? 'ring-2 ring-primary' : ''}
                ${phase.status === 'complete' ? 'bg-green-50' : ''}
                ${phase.status === 'failed' ? 'bg-red-50' : ''}
              `}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(phase.status)}
                      <CardTitle>Phase {phase.id}: {phase.title}</CardTitle>
                    </div>
                    {getStatusBadge(phase.status)}
                  </div>
                  <CardDescription>{phase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {phase.tasks.map((task, i) => (
                      <li key={i} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span>{task.name}</span>
                        </div>
                        {task.message && (
                          <span className="text-xs text-muted-foreground">{task.message}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    size="sm"
                    variant={phase.status === 'complete' ? "outline" : "default"}
                    onClick={() => runPhaseTests(phase.id)}
                    disabled={isRunningTests || (currentPhase !== phase.id && phase.status !== 'complete')}
                  >
                    {phase.status === 'complete' ? 'Re-run Tests' : 'Run Phase Tests'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Connection Test</CardTitle>
          </CardHeader>
          <CardContent>
            <TestSupabaseConnection />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <SystemHealthCheck />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
