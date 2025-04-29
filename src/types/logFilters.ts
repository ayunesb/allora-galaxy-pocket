
export interface LogFilters {
  eventTypes: string[];
  severity: string[];
  dateRange: number;
  dateFrom?: string; // Add missing property
  dateTo?: string;   // Add missing property
  search?: string;   // Add missing property
  tenantId?: string; // Add missing property
  service?: string;  // Add missing property
  userId?: string;
}

export const DEFAULT_FILTERS: LogFilters = {
  eventTypes: [],
  severity: [],
  dateRange: 7,
  dateFrom: undefined,
  dateTo: undefined,
  search: '',
  tenantId: undefined,
  service: undefined,
  userId: undefined
};
