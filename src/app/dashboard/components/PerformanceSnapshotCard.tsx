
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartBar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  roi: string;
  leads: number;
}

export function PerformanceSnapshotCard({ roi, leads }: Props) {
  const navigate = useNavigate();
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          <ChartBar className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Performance Snapshot</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          This week: ROI {roi || '0x'}, {leads || 0} leads
        </p>
        <Button
          variant="link"
          className="mt-2 h-auto p-0"
          onClick={() => navigate("/dashboard/performance")}
        >
          View Full Report →
        </Button>
      </CardContent>
    </Card>
  );
}
