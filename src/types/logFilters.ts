
export interface LogFilters {
  eventType?: string;
  severity?: string;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  userId?: string;
  tenantId?: string;
  searchTerm?: string;
  // Add missing properties
  search?: string;
  dateRange?: number;
  service?: string;
}

export const DEFAULT_FILTERS: LogFilters = {
  eventType: 'all',
  severity: 'all',
  dateFrom: null,
  dateTo: null,
  search: '',
  dateRange: 7,
  service: 'all'
};

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  logsPerPage: number;
}
