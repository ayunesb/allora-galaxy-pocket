
import { Card, CardContent } from "@/components/ui/card";

interface CampaignGridProps {
  campaigns: Record<string, string>;
}

export function CampaignGrid({ campaigns }: CampaignGridProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {Object.entries(campaigns).map(([channel, message]) => (
        <Card key={channel}>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground capitalize mb-2">{channel}</p>
            <p className="text-sm">{message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
