
export interface LogFilters {
  eventType?: string;
  severity?: string;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  userId?: string;
  tenantId?: string;
  searchTerm?: string;
}
