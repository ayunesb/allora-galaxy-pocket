
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Campaign } from "@/types/campaign";

interface CampaignScriptsProps {
  campaign: Campaign;
}

export default function CampaignScripts({ campaign }: CampaignScriptsProps) {
  const scripts = campaign.scripts || {};
  const scriptKeys = Object.keys(scripts);
  
  if (scriptKeys.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No content scripts available for this campaign.
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-6">
      {scriptKeys.map(key => (
        <Card key={key}>
          <CardHeader>
            <CardTitle className="capitalize">{key}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">
              {scripts[key]}
            </pre>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { CampaignScripts };
