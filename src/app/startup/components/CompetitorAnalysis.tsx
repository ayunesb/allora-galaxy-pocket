
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CompetitorAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🕵️ Competitor Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Your closest competitor just launched a similar campaign. Let's stay ahead.
        </p>
      </CardContent>
    </Card>
  );
}
