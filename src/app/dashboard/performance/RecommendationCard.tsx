
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecommendationCardProps {
  recommendation: string;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">✅ Next AI Recommendation</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{recommendation}</p>
      </CardContent>
    </Card>
  );
}
