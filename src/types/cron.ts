
export type CronJobStatus = "success" | "error" | "pending" | "running";

export interface CronJobLog {
  id: string;
  function_name: string;
  ran_at: string;
  status: CronJobStatus;
  message?: string;
  duration_ms?: number;
  tenant_id?: string;
}
