
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Pause } from "lucide-react";

interface CampaignCardProps {
  name: string;
  status: "active" | "paused" | "draft";
  cta: () => void;
}

export default function CampaignCard({ name, status, cta }: CampaignCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{name}</CardTitle>
        {status === "active" ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <Pause className="h-4 w-4 text-yellow-500" />
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Status: {status.charAt(0).toUpperCase() + status.slice(1)}</p>
        <Button 
          variant="link" 
          onClick={cta}
          className="mt-2 h-auto p-0"
        >
          View Recap
        </Button>
      </CardContent>
    </Card>
  );
}
