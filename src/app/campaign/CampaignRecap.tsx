
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface CampaignRecapProps {
  name: string;
  summary: string;
}

export default function CampaignRecap({ name, summary }: CampaignRecapProps) {
  return (
    <Card className="bg-slate-50">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <TrendingUp className="h-5 w-5 text-green-500" />
        <CardTitle className="text-lg">{name} Recap</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{summary}</p>
      </CardContent>
    </Card>
  );
}
