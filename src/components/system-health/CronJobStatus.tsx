import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCronJobStatus } from "@/hooks/useCronJobStatus";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CronJobLog } from "@/types/cron";

export function CronJobStatus() {
  const { data: cronJobs, isLoading } = useCronJobStatus();

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle>Automation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 bg-muted rounded" />
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {hasFailures ? (
            <XCircle className="h-5 w-5 text-destructive" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          Automation Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasFailures ? (
          <Alert variant="destructive">
            <AlertTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Failed Jobs Detected
            </AlertTitle>
            <AlertDescription>
              Some automated tasks have failed. Check the logs for details.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <AlertTitle className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              All Systems Operational
            </AlertTitle>
            <AlertDescription>
              Automated tasks are running as scheduled.
            </AlertDescription>
          </Alert>
        )}

        {/* Function Status Summary */}
        <div className="grid gap-2 md:grid-cols-2">
          {uniqueFunctions.map((job) => (
            <div 
              key={job.function_name} 
              className="flex items-center justify-between p-2 rounded-md border"
            >
              <div className="flex items-center gap-2">
                {job.status === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : job.status === 'error' ? (
                  <XCircle className="h-4 w-4 text-destructive" />
                ) : job.status === 'running' ? (
                  <Clock className="h-4 w-4 text-amber-500 animate-spin" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium truncate max-w-[150px]">{job.function_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={job.status === 'error' ? 'destructive' : job.status === 'success' ? 'success' : 'default'}>
                  {job.status}
                </Badge>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(job.ran_at), 'MMM d, h:mm a')}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Recent Job Executions */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Recent Job Executions</h3>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {cronJobs?.slice(0, 8).map((job) => (
              <div 
                key={job.id} 
                className="flex items-center justify-between p-2 rounded-md border bg-background/50 text-sm"
              >
                <div>
                  <p className="font-medium">{job.function_name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-[300px]">
                    {job.message}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {job.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : job.status === 'error' ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : job.status === 'running' ? (
                    <Clock className="h-4 w-4 text-amber-500 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(job.ran_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
