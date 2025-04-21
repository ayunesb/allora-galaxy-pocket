
import React, { useState } from "react";
import type { Campaign } from "@/types/campaign";
import CampaignCard from "./CampaignCard";
import CampaignRecap from "./CampaignRecap";

const campaigns: Campaign[] = [
  { name: "B2B Cold Outreach", status: "Active", summary: "Open rates hit 54%. Booked 22 calls in 5 days." },
  { name: "Instagram Lead Magnet", status: "Paused", summary: "Cost per lead peaked at $9.24 before auto-optimization." }
];

export default function CampaignPage() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Active Campaigns</h1>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {campaigns.map((c, i) => (
          <CampaignCard
            key={c.name}
            name={c.name}
            status={c.status}
            cta={() => setSelected(i)}
          />
        ))}
      </div>

      {selected !== null && (
        <CampaignRecap
          name={campaigns[selected].name}
          summary={campaigns[selected].summary}
        />
      )}
    </div>
  );
}
