
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Campaign } from '@/types/campaign';

interface CampaignEditorProps {
  campaign: Campaign;
  readOnly?: boolean;
}

export const CampaignEditor: React.FC<CampaignEditorProps> = ({ campaign, readOnly = false }) => {
  const hasScripts = campaign.scripts && Object.keys(campaign.scripts).length > 0;
  
  if (!hasScripts) {
    return (
      <div className="text-center py-8 bg-muted/30 rounded-md">
        <p className="text-muted-foreground">No campaign content available.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {campaign.scripts?.channels && Object.entries(campaign.scripts.channels).map(([channel, content]) => (
        <Card key={channel}>
          <CardHeader>
            <CardTitle className="capitalize">{channel}</CardTitle>
          </CardHeader>
          <CardContent>
            {typeof content === 'string' ? (
              <div className="whitespace-pre-wrap bg-muted/30 p-4 rounded-md">
                {content}
              </div>
            ) : (
              <pre className="bg-muted/30 p-4 rounded-md overflow-auto">
                {JSON.stringify(content, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      ))}
      
      {/* Handle other script types if present */}
      {campaign.scripts && Object.entries(campaign.scripts)
        .filter(([key]) => key !== 'channels')
        .map(([key, content]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="capitalize">{key}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted/30 p-4 rounded-md overflow-auto">
                {JSON.stringify(content, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}
    </div>
  );
};
