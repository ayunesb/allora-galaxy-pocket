
import React from "react";
import KpiCard from "./KpiCard";
import MilestoneItem from "./MilestoneItem";
import CoachingFeed from "@/app/coaching/feed/CoachingFeed";

const kpis = [
  { label: "Monthly Recurring Revenue", value: "$3,200", trend: "up" as const },
  { label: "Customer LTV", value: "$780", trend: "up" as const },
  { label: "Churn Rate", value: "4.2%", trend: "down" as const },
  { label: "CAC", value: "$71", trend: "down" as const }
];

const milestones = [
  { label: "Launch Strategy Approved", achieved: true },
  { label: "Reached $1K MRR", achieved: true },
  { label: "Automated Campaign Deployed", achieved: false },
  { label: "First AI Agent Activated", achieved: false }
];

export default function StartupDashboard() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Startup Dashboard</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Your KPIs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Milestones</h2>
          <div className="space-y-3">
            {milestones.map((m) => (
              <MilestoneItem key={m.label} {...m} />
            ))}
          </div>
        </section>

        <section>
          <CoachingFeed />
        </section>
      </div>
    </div>
  );
}

