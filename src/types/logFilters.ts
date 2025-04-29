
import { LogSeverity } from './systemLog';

export interface LogFilters {
  dateRange: number;
  eventType: string | null;
  searchTerm: string;
}

export const DEFAULT_FILTERS: LogFilters = {
  dateRange: 7,
  eventType: null,
  searchTerm: ''
};

export interface SystemLogFilter {
  startDate?: Date;
  endDate?: Date;
  eventTypes?: string[];
  severity?: LogSeverity[];
  search?: string;
  limit?: number;
  offset?: number;
}
