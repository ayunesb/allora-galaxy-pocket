
export interface ExportFilters {
  tenantId: string;
  dateRange?: number;
  type?: 'strategy' | 'campaign' | 'kpi' | 'system';
  userId?: string;
  search?: string;
  groupBy?: 'strategy' | 'channel' | 'date';
}

export interface ExportOptions {
  includeMetadata?: boolean;
  includeCharts?: boolean;
  emailTo?: string[];
  attachCoverPage?: boolean;
}

