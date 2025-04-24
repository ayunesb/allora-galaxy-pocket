
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useCronJobStatus } from "@/hooks/useCronJobStatus";
import { CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CronJobLog } from "@/types/cron";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

export function CronJobStatus() {
  const { data: cronJobs, isLoading, refetch, isRefetching } = useCronJobStatus();
  const isMobile = useIsMobile();
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle>Automation Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <div className="grid gap-2 md:grid-cols-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentFailures = cronJobs?.filter(job => job.status === 'error') || [];
  const hasFailures = recentFailures.length > 0;
  
  // Group by function name to show latest status for each function
  const functionGroups = cronJobs?.reduce((acc, job) => {
    if (!acc[job.function_name] || new Date(job.ran_at) > new Date(acc[job.function_name].ran_at)) {
      acc[job.function_name] = job;
    }
    return acc;
  }, {} as Record<string, CronJobLog>) || {};
  
  // Get the list of unique functions
  const uniqueFunctions = Object.values(functionGroups);
  
  // Sort by most recently run
  uniqueFunctions.sort((a, b) => new Date(b.ran_at).getTime() - new Date(a.ran_at).getTime());

  // Calculate health score based on success rate
  const totalFunctions = uniqueFunctions.length;
  const successfulFunctions = uniqueFunctions.filter(job => job.status === 'success').length;
  const healthScore = totalFunctions > 0 ? Math.round((successfulFunctions / totalFunctions) * 100) : 100;

  // Get status counts
  const statusCounts = {
    success: uniqueFunctions.filter(job => job.status === 'success').length,
    error: uniqueFunctions.filter(job => job.status === 'error').length,
    running: uniqueFunctions.filter(job => job.status === 'running').length,
  };

  const toggleJobExpansion = (jobId: string) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'success': return "bg-green-500";
      case 'error': return "bg-red-500";
      case 'running': return "bg-amber-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {hasFailures ? (
              <XCircle className="h-5 w-5 text-destructive" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            Automation Status
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refetch()} 
            disabled={isRefetching}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Score Summary */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-muted rounded-lg">
          <div className="flex flex-col items-center sm:items-start">
            <span className="text-sm text-muted-foreground">System Health</span>
            <span className="text-2xl font-bold">{healthScore}%</span>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            <Badge variant="outline" className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
              {statusCounts.success} Successful
            </Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-700 hover:bg-red-500/20">
              {statusCounts.error} Failed
            </Badge>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20">
              {statusCounts.running} Running
            </Badge>
          </div>
        </div>

        {hasFailures && (
          <Alert variant="destructive">
            <AlertTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Failed Jobs Detected
            </AlertTitle>
            <AlertDescription>
              {recentFailures.length} automated {recentFailures.length === 1 ? 'task has' : 'tasks have'} failed. Check the logs for details.
            </AlertDescription>
          </Alert>
        )}

        {/* Function Status Summary - Responsive Grid */}
        <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
          {uniqueFunctions.map((job) => (
            <div 
              key={job.id} 
              className={`flex flex-col p-3 rounded-md border cursor-pointer transition-all ${
                expandedJob === job.id ? 'bg-muted/50 border-primary/50' : ''
              }`}
              onClick={() => toggleJobExpansion(job.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(job.status)}`}></div>
                  <span className="font-medium truncate max-w-[150px]">{job.function_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    job.status === 'error' ? 'destructive' : 
                    job.status === 'success' ? 'default' : 
                    'outline'
                  }>
                    {job.status}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(job.ran_at), { addSuffix: true })}
                </span>
                <span>{format(new Date(job.ran_at), 'MMM d, h:mm a')}</span>
              </div>
              
              {expandedJob === job.id && job.message && (
                <div className="mt-2 p-2 bg-muted/30 rounded text-sm break-words">
                  {job.message}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Recent Job Executions - Collapsible on mobile */}
        {cronJobs && cronJobs.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Recent Job Executions</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {cronJobs.slice(0, isMobile ? 4 : 8).map((job) => (
                <div 
                  key={job.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-md border bg-background/50 text-sm"
                >
                  <div className="max-w-full sm:max-w-[60%]">
                    <p className="font-medium truncate">{job.function_name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-full">
                      {job.message || "No message provided"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 sm:mt-0">
                    {job.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : job.status === 'error' ? (
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                    ) : job.status === 'running' ? (
                      <Clock className="h-4 w-4 text-amber-500 animate-spin shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(job.ran_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      {isMobile && cronJobs && cronJobs.length > 4 && (
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => {}}>
            View All ({cronJobs.length}) Jobs
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
