
import { useEffect, useState } from 'react';
import { KPITracker } from '@/components/KPITracker';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';

export default function KpiDashboard() {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKpis = async () => {
      const { data, error } = await supabase
        .from('kpi_metrics')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching KPIs:', error);
        return;
      }

      setKpis(data || []);
      setLoading(false);
    };

    fetchKpis();
  }, []);

  if (loading) {
    return <div>Loading KPIs...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">KPI Dashboard</h2>
      <KPITracker kpis={kpis} />
    </Card>
  );
}
