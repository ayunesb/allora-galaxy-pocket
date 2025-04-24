
export interface CronJobLog {
  id: string;
  function_name: string;
  status: 'success' | 'error' | 'running';
  ran_at: string;
  message?: string;
}
