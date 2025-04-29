import { KPI } from '../../types/kpi';

export function getMockKpiData(): KPI[] {
  return [
    { label: 'MRR', value: '$12,300', unit: 'USD' },
    { label: 'Churn Rate', value: '4.2%', unit: '%' },
    { label: 'LTV', value: '$930', unit: 'USD' },
    { label: 'Active Users', value: '1,250', unit: 'users' },
    { label: 'Avg. Conversion Time', value: '12 days', unit: '' },
  ];
}
