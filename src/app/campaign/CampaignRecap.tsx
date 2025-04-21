
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface CampaignRecapProps {
  name: string;
  strategy_id?: string;
  summary?: string;
}

export default function CampaignRecap({ name, strategy_id, summary }: CampaignRecapProps) {
  // Generate a default summary if one isn't provided
  const displaySummary = summary || 
    `Campaign based on strategy ${strategy_id || 'unknown'}. Performance metrics and analytics will appear here once the campaign has collected enough data.`;

  return (
    <Card className="bg-slate-50">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <TrendingUp className="h-5 w-5 text-green-500" />
        <CardTitle className="text-lg">{name} Recap</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{displaySummary}</p>
      </CardContent>
    </Card>
  );
}
