
import { LogSeverity } from '@/types/systemLog';

export interface LogFilters {
  search: string;
  dateRange: number; // in days
  eventType: string;
  severity?: LogSeverity | 'all';
  service?: string;
  userId?: string;
}

export const DEFAULT_FILTERS: LogFilters = {
  search: "",
  dateRange: 7, // Default to last 7 days
  eventType: "all",
  severity: "all",
  service: undefined,
  userId: undefined,
};

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  logsPerPage: number;
}
