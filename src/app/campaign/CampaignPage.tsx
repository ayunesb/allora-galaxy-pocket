
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
    description: "A strategy for reaching out to B2B prospects"
  },
  { 
    id: "2",
    name: "Instagram Lead Magnet", 
    status: "paused",
    created_at: new Date().toISOString(),
    description: "Content strategy to attract leads via Instagram"
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
          description={campaigns[selected].description}
        />
      )}
    </div>
  );
}
