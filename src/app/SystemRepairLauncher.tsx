
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { useSystemVerification } from '@/hooks/useSystemVerification';
import { useLaunchReadiness } from '@/hooks/useLaunchReadiness';
import { Loader2, CheckCircle2, AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { KPITrackerWithData } from '@/components/KPITracker';

export default function SystemRepairLauncher() {
  const { isHealthy, issues, performCheck, isChecking } = useSystemHealth();
  const { isComplete, isRunning, results, startVerification } = useSystemVerification();
  const { healthScore, status, runChecks, isRunning: isLaunchRunning } = useLaunchReadiness();
  const [isRepairing, setIsRepairing] = useState(false);
  const navigate = useNavigate();

  const handleRepairSystem = async () => {
    setIsRepairing(true);
    toast.info('System repair initiated');
    
    try {
      await performCheck();
      await startVerification();
      await runChecks();
      
      toast.success('System checks completed');
    } catch (error) {
      toast.error('Error during system repair');
      console.error('Repair error:', error);
    } finally {
      setIsRepairing(false);
    }
  };
  
  const navigateToHealthDashboard = () => {
    navigate('/admin/system-status');
  };

  const getOverallScore = () => {
    if (!isComplete) return 0;
    const totalChecks = results.length;
    const passedChecks = results.filter(check => check.passed).length;
    return totalChecks ? Math.round((passedChecks / totalChecks) * 100) : 0;
  };
  
  const overallScore = getOverallScore();
  const isLoading = isChecking || isRunning || isLaunchRunning || isRepairing;
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <LoadingOverlay show={isRepairing} label="Running system diagnostics..." />
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">System Health Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and repair system components
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              System Health
              {isHealthy ? (
                <Badge variant="success" className="bg-green-500">Healthy</Badge>
              ) : (
                <Badge variant="destructive">Issues Detected</Badge>
              )}
            </CardTitle>
            <CardDescription>Database and authentication connectivity</CardDescription>
          </CardHeader>
          <CardContent>
            {issues.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {issues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">All systems operational</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={performCheck}
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Run Health Check
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              System Verification
              {isComplete && (
                <Badge variant={overallScore >= 70 ? "success" : "destructive"} className={overallScore >= 70 ? "bg-green-500" : ""}>
                  {overallScore}%
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Security and configuration validation</CardDescription>
          </CardHeader>
          <CardContent>
            {isComplete ? (
              <div className="space-y-4">
                <Progress value={overallScore} className="h-2" />
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{result.name}</span>
                      {result.passed ? (
                        <Badge variant="outline" className="border-green-500 text-green-500">Passed</Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-500 text-red-500">Failed</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <AlertTriangle className="h-12 w-12 text-amber-500 mb-2" />
                <p className="text-sm text-muted-foreground">Verification required</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={startVerification}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Verify System
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Launch Readiness
              {status === "complete" && (
                <Badge 
                  variant={healthScore >= 90 ? "success" : healthScore >= 70 ? "warning" : "destructive"} 
                  className={
                    healthScore >= 90 
                      ? "bg-green-500" 
                      : healthScore >= 70 
                        ? "bg-amber-500" 
                        : ""
                  }
                >
                  {healthScore}%
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Production readiness assessment</CardDescription>
          </CardHeader>
          <CardContent>
            {status === "complete" ? (
              <div className="space-y-4">
                <Progress value={healthScore} className="h-2" />
                <div className="pt-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Security:</span>
                      <span className="font-medium">{healthScore >= 90 ? "Excellent" : healthScore >= 70 ? "Good" : "Needs Work"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Performance:</span>
                      <span className="font-medium">{healthScore >= 85 ? "Optimized" : healthScore >= 65 ? "Acceptable" : "Poor"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <AlertTriangle className="h-12 w-12 text-amber-500 mb-2" />
                <p className="text-sm text-muted-foreground">Launch assessment needed</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={runChecks}
              disabled={isLaunchRunning}
            >
              {isLaunchRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Launch Readiness
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Perform system maintenance and diagnostic tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                onClick={handleRepairSystem}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mb-1" />
                ) : (
                  <RefreshCw className="h-6 w-6 mb-1" />
                )}
                Run Full Diagnostics
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={navigateToHealthDashboard}>
                <ArrowRight className="h-6 w-6 mb-1" />
                System Status Dashboard
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center" 
                onClick={() => navigate('/admin/system-repair')}
              >
                <ArrowRight className="h-6 w-6 mb-1" />
                Advanced Repair Tools
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => navigate('/launch-readiness')} 
              >
                <ArrowRight className="h-6 w-6 mb-1" />
                Launch Readiness Report
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>KPI Performance Metrics</CardTitle>
            <CardDescription>Monitor key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <KPITrackerWithData />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
