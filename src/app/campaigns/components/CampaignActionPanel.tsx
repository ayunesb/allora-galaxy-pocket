
// Update the specific problematic comparison in CampaignActionPanel.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/types/campaign";

interface CampaignActionPanelProps {
  campaign: Campaign;
  onStart?: () => void;
  onPause?: () => void;
  onEdit?: () => void;
}

const CampaignActionPanel = ({ campaign, onStart, onPause, onEdit }: CampaignActionPanelProps) => {
  // Change the comparison to match the correct ExecutionStatus types
  const isRunning = campaign.execution_status === "running";
  const isPaused = campaign.execution_status === "pending" || campaign.execution_status === "paused";
  const isCompleted = campaign.execution_status === "completed";

  return (
    <div className="flex flex-wrap gap-2">
      {isPaused && (
        <Button onClick={onStart} variant="default" size="sm">
          Start Campaign
        </Button>
      )}
      {isRunning && (
        <Button onClick={onPause} variant="outline" size="sm">
          Pause Campaign
        </Button>
      )}
      {!isCompleted && (
        <Button onClick={onEdit} variant="secondary" size="sm">
          Edit Campaign
        </Button>
      )}
    </div>
  );
};

export { CampaignActionPanel };
