
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCronJobStatus } from "@/hooks/useCronJobStatus";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

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
            <AlertTitle>Failed Jobs Detected</AlertTitle>
            <AlertDescription>
              Some automated tasks have failed. Check the logs for details.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <AlertTitle>All Systems Operational</AlertTitle>
            <AlertDescription>
              Automated tasks are running as scheduled.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          {cronJobs?.map((job) => (
            <div 
              key={job.id} 
              className="flex items-center justify-between p-2 rounded-md border"
            >
              <div>
                <p className="font-medium">{job.function_name}</p>
                <p className="text-sm text-muted-foreground">
                  {job.message}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {job.status === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : job.status === 'error' ? (
                  <XCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground animate-spin" />
                )}
                <span className="text-sm text-muted-foreground">
                  {format(new Date(job.ran_at), 'MMM d, h:mm a')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
