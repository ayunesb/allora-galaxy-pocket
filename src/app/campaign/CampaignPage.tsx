
import React, { useState } from "react";
import type { Campaign } from "@/types/campaign";
import CampaignCard from "./CampaignCard";
import CampaignRecap from "./CampaignRecap";

const campaigns: Campaign[] = [
  { 
    id: "1",
    name: "B2B Cold Outreach", 
    status: "active", 
    created_at: new Date().toISOString(),
    strategy_id: "strategy-1" 
  },
  { 
    id: "2",
    name: "Instagram Lead Magnet", 
    status: "paused",
    created_at: new Date().toISOString(),
    strategy_id: "strategy-2"
  }
];

export default function CampaignPage() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Active Campaigns</h1>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {campaigns.map((c, i) => (
          <CampaignCard
            key={c.id}
            name={c.name}
            status={c.status}
            cta={() => setSelected(i)}
          />
        ))}
      </div>

      {selected !== null && (
        <CampaignRecap
          name={campaigns[selected].name}
          strategy_id={campaigns[selected].strategy_id}
        />
      )}
    </div>
  );
}

