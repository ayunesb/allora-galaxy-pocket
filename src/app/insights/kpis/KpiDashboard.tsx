
import { useEffect, useState } from 'react';
import { KPITrackerWithData } from '@/components/KPITracker';
import { Card } from '@/components/ui/card';

export default function KpiDashboard() {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">KPI Dashboard</h2>
      <KPITrackerWithData />
    </Card>
  );
}
