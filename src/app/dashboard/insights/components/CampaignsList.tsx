
import { Card, CardContent } from "@/components/ui/card";
import type { Campaign } from "@/types/campaign";

type CampaignsListProps = {
  campaigns: Campaign[];
};

export function CampaignsList({ campaigns }: CampaignsListProps) {
  return (
    <Card>
      <CardContent className="p-4">
        {campaigns.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No campaigns found for the selected period
          </p>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{campaign.name}</h3>
                  {campaign.description && (
                    <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
                  )}
                </div>
                <span className={`text-sm px-2 py-1 rounded ${
                  campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {campaign.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
