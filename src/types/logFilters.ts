
export interface LogFilters {
  searchTerm?: string;
  search?: string;
  eventType?: string;
  severity?: string;
  dateRange?: number;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  tenantId?: string;
  service?: string;
}

export const DEFAULT_FILTERS: LogFilters = {
  searchTerm: '',
  eventType: 'all',
  severity: 'all',
  dateRange: 7 // last 7 days
};
