
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import FeedbackChart from "../FeedbackChart";

type FeedbackAnalyticsProps = {
  grouped: Record<string, { used: number; dismissed: number; }>;
};

export function FeedbackAnalytics({ grouped }: FeedbackAnalyticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Feedback Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(grouped).length > 0 ? (
          <div className="h-[400px]">
            <FeedbackChart grouped={grouped} />
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">
            No feedback data available for the selected period.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
