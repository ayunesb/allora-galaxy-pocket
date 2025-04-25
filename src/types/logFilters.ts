
import { LogSeverity } from './systemLog';

export interface LogFilters {
  search: string;
  eventType: string;
  severity: LogSeverity | 'all';
  service?: string;
  dateRange: number; // Days
  userId?: string;
}

export const DEFAULT_FILTERS: LogFilters = {
  search: '',
  eventType: 'all',
  severity: 'all',
  dateRange: 7, // Last 7 days
};

// Pagination state for log tables
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  logsPerPage: number;
}
