
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, RefreshCw, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import { JobList } from './JobList';
import { JobFailureRecovery } from './JobFailureRecovery';

export function JobMonitoringPanel() {
  const { data: cronJobs, isLoading, refetch } = useQuery({
    queryKey: ['cron-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cron_job_logs')
        .select('*')
        .order('ran_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: retryQueue, isLoading: isLoadingRetry } = useQuery({
    queryKey: ['retry-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retry_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const handleRefresh = () => {
    refetch();
    toast.success('Job data refreshed');
  };

  const jobStats = React.useMemo(() => {
    if (!cronJobs) return { success: 0, error: 0, running: 0, total: 0 };
    
    return cronJobs.reduce((acc, job) => {
      acc.total += 1;
      if (job.status === 'success') acc.success += 1;
      if (job.status === 'error') acc.error += 1;
      if (job.status === 'running') acc.running += 1;
      return acc;
    }, { success: 0, error: 0, running: 0, total: 0 });
  }, [cronJobs]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Scheduled Jobs</CardTitle>
          <CardDescription>Monitor and manage system scheduled jobs</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-muted rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Jobs</p>
              <p className="text-2xl font-bold">{jobStats.total}</p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Successful</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{jobStats.success}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 dark:text-red-400">Failed</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{jobStats.error}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 dark:text-amber-400">Running</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{jobStats.running}</p>
            </div>
            <PlayCircle className="h-8 w-8 text-amber-500" />
          </div>
        </div>
        
        <Tabs defaultValue="jobs">
          <TabsList className="mb-4">
            <TabsTrigger value="jobs">Job History</TabsTrigger>
            <TabsTrigger value="recovery">
              Failed Jobs 
              {retryQueue?.length > 0 && (
                <Badge variant="destructive" className="ml-2">{retryQueue.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="scheduler">Job Scheduler</TabsTrigger>
          </TabsList>
          <TabsContent value="jobs">
            <JobList jobs={cronJobs} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="recovery">
            <JobFailureRecovery retryQueue={retryQueue} isLoading={isLoadingRetry} />
          </TabsContent>
          <TabsContent value="scheduler">
            <div className="border rounded-md p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Job Scheduler</h3>
              <p className="text-muted-foreground mb-4">
                Schedule new jobs or modify existing scheduled tasks
              </p>
              <Button>
                <Clock className="mr-2 h-4 w-4" /> Configure Job Schedule
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
