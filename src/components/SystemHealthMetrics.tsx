
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { useLaunchReadiness } from '@/hooks/useLaunchReadiness';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function SystemHealthMetrics() {
  const { isHealthy, issues, performCheck, isChecking } = useSystemHealth();
  const { healthScore, status, runChecks, isRunning } = useLaunchReadiness();
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center justify-between">
          System Status
          {isChecking || isRunning ? (
            <Badge variant="outline" className="bg-gray-100">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Checking...
            </Badge>
          ) : isHealthy ? (
            <Badge variant="success" className="bg-green-500">Healthy</Badge>
          ) : (
            <Badge variant="destructive">Issues</Badge>
          )}
        </CardTitle>
        <CardDescription>System health and launch readiness</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Health Status</span>
              <span className="text-sm font-medium flex items-center">
                {isHealthy ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                    Operational
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />
                    {issues.length} {issues.length === 1 ? 'issue' : 'issues'} detected
                  </>
                )}
              </span>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Launch Readiness</span>
              <span className="text-sm font-medium">
                {status === "complete" ? `${healthScore}%` : "Unchecked"}
              </span>
            </div>
            <Progress 
              value={status === "complete" ? healthScore : 0} 
              className="h-1.5"
              color={healthScore >= 90 ? "bg-green-500" : healthScore >= 70 ? "bg-amber-500" : "bg-red-500"}
            />
          </div>
          
          <div className="pt-2 flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs h-7"
              onClick={performCheck}
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Checking
                </>
              ) : (
                <>
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Health Check
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs h-7"
              onClick={runChecks}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Launch Check
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
