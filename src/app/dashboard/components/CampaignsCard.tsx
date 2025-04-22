
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  campaignsCount: number;
}

export function CampaignsCard({ campaignsCount }: Props) {
  const navigate = useNavigate();
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="font-semibold mb-2 flex items-center gap-2">
          <Rocket className="h-4 w-4 text-primary" />
          Campaigns
        </h2>
        <p className="text-sm text-muted-foreground">
          {campaignsCount} {campaignsCount === 1 ? 'campaign' : 'campaigns'} awaiting approval
        </p>
        <Button
          variant="link"
          className="mt-2 h-auto p-0"
          onClick={() => navigate("/campaigns/center")}
        >
          Go to Campaign Center →
        </Button>
      </CardContent>
    </Card>
  );
}
