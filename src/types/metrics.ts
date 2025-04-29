
// Add missing KpiMetric type
export interface KpiMetric {
  id: string;
  metric: string;
  value: number;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
  recorded_at?: string;
}
