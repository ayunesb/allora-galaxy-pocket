
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  title?: string;
}

export function CurrentStrategyCard({ title }: Props) {
  const navigate = useNavigate();
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="font-semibold mb-2 flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Current Strategy
        </h2>
        <p className="text-sm text-muted-foreground">
          {title || "No active strategy found"}
        </p>
        <Button
          variant="link"
          className="mt-2 h-auto p-0"
          onClick={() => navigate("/strategy")}
        >
          View Full Strategy →
        </Button>
      </CardContent>
    </Card>
  );
}
