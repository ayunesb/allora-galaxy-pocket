
export interface LogFilters {
  eventType?: string;
  severity?: string;
  dateRange?: number;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  tenantId?: string;
  service?: string;
  searchTerm?: string;
  search?: string;
}

export const DEFAULT_FILTERS: LogFilters = {
  eventType: 'all',
  severity: 'all',
  dateRange: 7,
  userId: 'all',
  tenantId: 'all',
  service: 'all',
  searchTerm: ''
};
