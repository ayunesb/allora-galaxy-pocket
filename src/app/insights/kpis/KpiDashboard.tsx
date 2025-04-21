
import React from "react";
import KpiCard from "./KpiCard";
import type { KpiMetric } from "@/types/kpi";

const mockKpis: KpiMetric[] = [
  { label: "Monthly Revenue", value: "$4,200", trend: "up", changePercent: 12 },
  { label: "Customer Churn", value: "3.8%", trend: "down", changePercent: 2.1 },
  { label: "Avg. Customer LTV", value: "$840", trend: "up", changePercent: 5.3 },
  { label: "Total Users", value: 938, trend: "up", changePercent: 8.7 },
  { label: "Active Campaigns", value: 7, trend: "up", changePercent: 16.7 },
  { label: "Vault Strategies", value: 14, trend: "up", changePercent: 27.3 }
];

export default function KpiDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">KPI Dashboard</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockKpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>
    </div>
  );
}
