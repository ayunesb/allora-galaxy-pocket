
export function getReportTypeName(type?: string): string {
  switch (type) {
    case 'strategy':
      return 'Strategy';
    case 'campaign':
      return 'Campaign';
    case 'kpi':
      return 'KPI Metrics';
    case 'system':
      return 'System Activity';
    default:
      return 'System Activity';
  }
}

