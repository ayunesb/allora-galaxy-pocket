
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertCircle, Check, Clock, Play } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface RetryQueueItem {
  id: string;
  task: string;
  status: string;
  retry_count: number;
  max_attempts: number;
  created_at: string;
  error_message?: string;
  next_attempt_at?: string;
  tenant_id: string;
}

interface JobFailureRecoveryProps {
  retryQueue?: RetryQueueItem[];
  isLoading: boolean;
}

export function JobFailureRecovery({ retryQueue, isLoading }: JobFailureRecoveryProps) {
  const [processingJob, setProcessingJob] = useState<string | null>(null);
  
  const handleRetryJob = async (jobId: string) => {
    try {
      setProcessingJob(jobId);
      
      // Call the retry-runner edge function with specific job ID
      const { data, error } = await supabase.functions.invoke('retry-runner', {
        body: { job_id: jobId }
      });
      
      if (error) throw error;
      
      toast.success('Job retry initiated');
      
    } catch (error) {
      console.error('Error retrying job:', error);
      toast.error('Failed to retry job');
    } finally {
      setProcessingJob(null);
    }
  };
  
  const handleGenerateRecoveryPlan = async (jobId: string, task: string) => {
    try {
      setProcessingJob(jobId);
      
      // Call the auto-recover edge function
      const { data, error } = await supabase.functions.invoke('auto-recover', {
        body: { alert_id: jobId }
      });
      
      if (error) throw error;
      
      toast.success('Recovery plan generated', {
        description: 'An AI recovery strategy has been created for this failed job'
      });
      
    } catch (error) {
      console.error('Error generating recovery plan:', error);
      toast.error('Failed to generate recovery plan');
    } finally {
      setProcessingJob(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="w-full h-20" />
        ))}
      </div>
    );
  }

  if (!retryQueue || retryQueue.length === 0) {
    return (
      <Card className="bg-muted/40">
        <CardContent className="pt-6 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No failed jobs in queue</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {retryQueue.map((job) => (
        <Card key={job.id} className={
          job.status === 'failed' ? 'border-red-200 dark:border-red-900' : 
          'border-amber-200 dark:border-amber-900'
        }>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">{job.task}</CardTitle>
                <CardDescription>
                  Attempt {job.retry_count} of {job.max_attempts}
                </CardDescription>
              </div>
              <Badge 
                variant={job.status === 'failed' ? 'destructive' : 'outline'}
                className="ml-auto"
              >
                {job.status === 'failed' ? 
                  <AlertCircle className="h-3 w-3 mr-1" /> : 
                  <Clock className="h-3 w-3 mr-1" />
                }
                {job.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-sm text-muted-foreground">
              {job.error_message && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-2 rounded text-xs mt-2 mb-2">
                  {job.error_message}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs">
                <span>Created: {new Date(job.created_at).toLocaleString()}</span>
                {job.next_attempt_at && (
                  <span>Next attempt: {new Date(job.next_attempt_at).toLocaleString()}</span>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 pt-1">
            <Button 
              size="sm" 
              variant="outline" 
              disabled={processingJob === job.id}
              onClick={() => handleRetryJob(job.id)}
            >
              {processingJob === job.id ? <Skeleton className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Retry Now
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              disabled={processingJob === job.id}
              onClick={() => handleGenerateRecoveryPlan(job.id, job.task)}
              className="border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
            >
              {processingJob === job.id ? <Skeleton className="h-4 w-4 mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Generate Recovery Plan
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
