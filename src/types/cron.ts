
export interface CronJobLog {
  id: string;
  function_name: string;
  status: 'success' | 'error' | 'running' | 'pending';
  ran_at: string;
  message?: string;
  duration_ms?: number;
  tenant_id?: string;
  attempts?: number;
  max_attempts?: number;
}

export type CronJobStatus = 'success' | 'error' | 'running' | 'pending';

export interface SystemHealthSummary {
  healthScore: number;
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  runningJobs: number;
  lastUpdated: string;
}
