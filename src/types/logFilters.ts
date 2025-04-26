
export interface LogFilters {
  eventType: string | null;
  severity: string | null;
  dateRange: number | null;
  dateFrom: string | null;
  dateTo: string | null;
  userId: string | null;
  tenantId: string | null;
  service: string | null;
  searchTerm: string | null;
  search?: string | null;
}

export const DEFAULT_FILTERS: LogFilters = {
  eventType: null,
  severity: null,
  dateRange: 7,
  dateFrom: null,
  dateTo: null,
  userId: null,
  tenantId: null,
  service: null,
  searchTerm: null,
  search: null
};
