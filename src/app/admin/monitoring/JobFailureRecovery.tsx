
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RetryQueueItem {
  id: string;
  task: string;
  tenant_id: string;
  retry_count: number;
  max_attempts: number;
  status: string;
  created_at: string;
  error_message?: string;
}

interface JobFailureRecoveryProps {
  retryQueue?: RetryQueueItem[];
  isLoading: boolean;
}

export function JobFailureRecovery({ retryQueue, isLoading }: JobFailureRecoveryProps) {
  const [selectedJob, setSelectedJob] = React.useState<RetryQueueItem | null>(null);
  const [isRetrying, setIsRetrying] = React.useState(false);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="w-full h-12" />
        ))}
      </div>
    );
  }

  if (!retryQueue || retryQueue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border rounded-md">
        <CheckCircleIcon className="h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-medium">All Jobs Running Properly</h3>
        <p className="text-muted-foreground mt-2">No failed jobs in the recovery queue</p>
      </div>
    );
  }

  const handleRetryAll = async () => {
    try {
      setIsRetrying(true);
      const { error } = await supabase.functions.invoke('retry-runner', {
        body: {}
      });
      
      if (error) throw error;
      
      toast.success('Initiated retry for all failed jobs');
    } catch (error: any) {
      toast.error('Failed to retry jobs', { 
        description: error.message || 'An unknown error occurred'
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSingleRetry = async (job: RetryQueueItem) => {
    setSelectedJob(null);
    try {
      setIsRetrying(true);
      const { error } = await supabase.functions.invoke('retry-runner', {
        body: { job_id: job.id }
      });
      
      if (error) throw error;
      
      toast.success(`Initiated retry for job: ${job.task}`);
    } catch (error: any) {
      toast.error('Failed to retry job', { 
        description: error.message || 'An unknown error occurred'
      });
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div>
      <div className="bg-muted/50 rounded-lg p-4 mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <div>
            <h3 className="font-medium">Failed Jobs Queue</h3>
            <p className="text-sm text-muted-foreground">
              {retryQueue.length} job{retryQueue.length !== 1 ? 's' : ''} waiting for retry
            </p>
          </div>
        </div>
        <Button 
          variant="default"
          onClick={handleRetryAll}
          disabled={isRetrying}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          Retry All Jobs
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {retryQueue.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <div className="font-medium">{job.task}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                    {job.error_message || 'No error details'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-500/50">
                    {job.status}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </div>
                </TableCell>
                <TableCell>
                  {job.retry_count} of {job.max_attempts}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedJob(job)}
                  >
                    <RefreshCw className="mr-1 h-3 w-3" /> Retry
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retry Failed Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to manually retry this job?
              <div className="mt-2 bg-muted p-2 rounded-md">
                <div><span className="font-medium">Task:</span> {selectedJob?.task}</div>
                <div><span className="font-medium">Attempts:</span> {selectedJob?.retry_count} of {selectedJob?.max_attempts}</div>
                {selectedJob?.error_message && (
                  <div className="mt-2">
                    <span className="font-medium">Error:</span>
                    <div className="text-sm text-red-500">{selectedJob.error_message}</div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedJob && handleSingleRetry(selectedJob)}
              disabled={isRetrying}
            >
              {isRetrying ? 'Retrying...' : 'Retry Job'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Additional icon component
function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
