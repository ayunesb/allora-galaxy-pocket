
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Campaign = {
  id: string;
  name: string;
  description: string | null;
  status: string;
};

type CampaignsListProps = {
  campaigns: Campaign[];
};

export function CampaignsList({ campaigns }: CampaignsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Performing Campaigns</CardTitle>
      </CardHeader>
      <CardContent>
        {campaigns && campaigns.length > 0 ? (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="font-medium">{campaign.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {campaign.description || "No description"}
                  </p>
                </div>
                <Badge variant={campaign.status === 'active' ? 'default' : 'outline'}>
                  {campaign.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">
            No campaigns found for the selected period.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
