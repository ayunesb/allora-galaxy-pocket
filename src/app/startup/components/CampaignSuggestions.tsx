
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Campaign {
  channel: string;
  message: string;
}

interface CampaignSuggestionsProps {
  campaigns: Campaign[];
}

export function CampaignSuggestions({ campaigns }: CampaignSuggestionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>💥 Campaign Suggestions</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {campaigns.map((campaign, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="font-semibold min-w-[100px]">{campaign.channel}:</span>
              <span className="text-muted-foreground">{campaign.message}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
