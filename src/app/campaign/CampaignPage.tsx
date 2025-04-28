
import React from 'react';
import { Campaign } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { DataLoader } from "@/components/ui/data-loader";

interface CampaignPageProps {
  campaign?: Campaign;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export default function CampaignPage({ 
  campaign, 
  isLoading = false,
  isError = false,
  error = null,
  onRetry
}: CampaignPageProps) {
  
  return (
    <DataLoader
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={campaign}
      onRetry={onRetry}
      loadingMessage="Loading campaign..."
      errorTitle="Failed to load campaign"
      emptyState={<div className="p-4 text-center">Campaign not found</div>}
    >
      {(campaignData) => (
        <div>
          {campaignData.status === 'pending' && (
            <Button>Approve</Button>
          )}
        </div>
      )}
    </DataLoader>
  );
}
