
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Strategy } from "@/types/strategy";

interface StrategyPreviewProps {
  strategy: Strategy | null;
}

export function StrategyPreview({ strategy }: StrategyPreviewProps) {
  const navigate = useNavigate();

  if (!strategy) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🎯 Current Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading strategy...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎯 Current Strategy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="font-semibold text-lg">{strategy.title}</h3>
        <p className="text-muted-foreground">{strategy.description}</p>
        <Button 
          variant="outline" 
          onClick={() => navigate(`/vault/strategy-detail/${strategy.id}`)}
        >
          View Full Strategy
        </Button>
      </CardContent>
    </Card>
  );
}
