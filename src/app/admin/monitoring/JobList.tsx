
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { CronJobLog } from '@/types/cron';

interface JobListProps {
  jobs?: CronJobLog[];
  isLoading: boolean;
}

export function JobList({ jobs, isLoading }: JobListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="w-full h-12" />
        ))}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">No job history found</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Function Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Execution Time</TableHead>
            <TableHead className="hidden md:table-cell">Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">{job.function_name}</TableCell>
              <TableCell>
                <Badge 
                  variant={job.status === 'success' ? 'default' : job.status === 'error' ? 'destructive' : 'outline'}
                  className="flex items-center gap-1"
                >
                  {getStatusIcon(job.status)}
                  {job.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(job.ran_at), { addSuffix: true })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(job.ran_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell truncate max-w-[300px]">
                {job.message || "No details available"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
