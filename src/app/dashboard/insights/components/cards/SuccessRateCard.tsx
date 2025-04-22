
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface SuccessRateCardProps {
  feedbackStats: {
    used: number;
    dismissed: number;
  };
}

export function SuccessRateCard({ feedbackStats }: SuccessRateCardProps) {
  const successRate = feedbackStats.used + feedbackStats.dismissed > 0
    ? Math.round((feedbackStats.used / (feedbackStats.used + feedbackStats.dismissed)) * 100)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Strategy Success Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{successRate}%</div>
        <p className="text-sm text-muted-foreground">
          {feedbackStats.used} approved, {feedbackStats.dismissed} declined
        </p>
      </CardContent>
    </Card>
  );
}

