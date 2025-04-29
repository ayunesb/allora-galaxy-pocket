
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { runAllChecks, calculateHealthScore, getReadinessStatus, CheckResult, CheckType } from '@/utils/launchReadiness';

export default function LaunchReadinessPage() {
  const [results, setResults] = useState<Partial<Record<CheckType, CheckResult>>>({});
  const [healthScore, setHealthScore] = useState(0);
  const [status, setStatus] = useState<'critical' | 'warning' | 'ready' | 'checking'>('checking');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkLaunchReadiness();
  }, []);

  const checkLaunchReadiness = async () => {
    setIsChecking(true);
    try {
      const checkResults = await runAllChecks();
      setResults(checkResults);
      
      const score = calculateHealthScore(checkResults);
      setHealthScore(score);
      
      setStatus(getReadinessStatus(score));
    } catch (error) {
      console.error("Error checking launch readiness:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'ready': return 'bg-green-500';
      case 'warning': return 'bg-amber-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'warning': return <AlertCircle className="h-6 w-6 text-amber-500" />;
      case 'critical': return <XCircle className="h-6 w-6 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Launch Readiness</h1>
        <Badge className={`text-lg px-3 py-1 ${getStatusColor()} text-white`}>
          {isChecking ? 'Checking...' : `${healthScore}%`}
        </Badge>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl flex items-center gap-2">
              {getStatusIcon()}
              <span>
                {status === 'ready' && 'Ready to Launch'}
                {status === 'warning' && 'Launch with Caution'}
                {status === 'critical' && 'Not Ready to Launch'}
                {status === 'checking' && 'Checking Readiness...'}
              </span>
            </CardTitle>
          </div>
          <CardDescription>
            {status === 'ready' && 'All systems are functioning properly and ready for launch.'}
            {status === 'warning' && 'Some issues need attention but launch is possible.'}
            {status === 'critical' && 'Critical issues must be fixed before launching.'}
            {status === 'checking' && 'Checking all systems and components...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress 
            value={healthScore} 
            className={`h-2 ${
              healthScore >= 80 ? 'bg-green-500' : 
              healthScore >= 60 ? 'bg-amber-500' : 
              'bg-red-500'
            }`} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {Object.entries(results).map(([checkType, result]) => (
              <div key={checkType} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{formatCheckTypeName(checkType as CheckType)}</p>
                  <p className="text-sm text-muted-foreground">{result.details}</p>
                </div>
                {result.passed ? (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
          
          <Button 
            className="w-full mt-6" 
            onClick={checkLaunchReadiness}
            disabled={isChecking}
          >
            {isChecking ? 'Checking...' : 'Run Checks Again'}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Fix Critical Issues</p>
                <p className="text-sm text-muted-foreground">
                  Address any critical issues identified in the readiness check
                </p>
              </div>
              <Button variant="ghost" size="sm">
                View Issues <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Verify Security</p>
                <p className="text-sm text-muted-foreground">
                  Run a comprehensive security audit before launch
                </p>
              </div>
              <Button variant="ghost" size="sm">
                Security Audit <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Launch Checklist</p>
                <p className="text-sm text-muted-foreground">
                  Complete the pre-launch checklist
                </p>
              </div>
              <Button variant="ghost" size="sm">
                View Checklist <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatCheckTypeName(checkType: CheckType): string {
  return checkType.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}
