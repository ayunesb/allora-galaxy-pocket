
import React from 'react';
import { Campaign } from "@/types/campaign";
import { Button } from "@/components/ui/button";

interface CampaignPageProps {
  campaign?: Campaign;
}

export default function CampaignPage() {
  const campaign: CampaignPageProps['campaign'] = {
    id: '123',
    name: 'Test Campaign',
    status: 'pending',
    created_at: '2021-09-29T00:00:00.000Z',
    updated_at: '2021-09-29T00:00:00.000Z',
  };
  
  const showApproveButton = campaign && campaign.status === 'pending';
  
  return (
    <div>
      {showApproveButton && (
        <Button>Approve</Button>
      )}
    </div>
  );
}
