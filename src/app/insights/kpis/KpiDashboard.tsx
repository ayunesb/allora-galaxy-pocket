
import { KPITracker } from "@/components/KPITracker";

export default function KpiDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">KPI Dashboard</h2>
      </div>
      <KPITracker />
    </div>
  );
}
